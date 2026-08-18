import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookies, setAuthCookies, REFRESH_TOKEN_COOKIE } from '@/lib/auth/sessionCookies';
import { getBackendApiUrl } from '@/lib/config/backend';
import { resolveAuthPayload, type AuthPayload } from '@/lib/auth/authPayload';
import type { Product } from '@/types/product';

const API_URL = getBackendApiUrl();

function parsePagination(searchParams: URLSearchParams) {
  const limitParam = Number(searchParams.get('limit'));
  const offsetParam = Number(searchParams.get('offset'));

  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;
  const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

  return { limit, offset };
}

async function readProductsPayload(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return [];
  }

  try {
    const payload = JSON.parse(responseText) as { data?: Product[] };
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  }
}

async function fetchProducts(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('origin');
  headers.delete('referer');
  headers.delete('content-length');
  headers.delete('connection');
  headers.delete('accept-encoding');
  headers.set('accept', 'application/json');

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('vendora_access_token')?.value;
  const businessId = cookieStore.get('vendora_business_id')?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (businessId) {
    headers.set('X-Business-ID', businessId);
  }

  const backendUrl = new URL(`${API_URL}/products`);
  const search = req.nextUrl.searchParams.get('search');
  const categoryId = req.nextUrl.searchParams.get('category_id');

  if (search) backendUrl.searchParams.set('search', search);
  if (categoryId) backendUrl.searchParams.set('category_id', categoryId);

  let response = await fetch(backendUrl, {
    method: 'GET',
    headers,
    redirect: 'manual',
  });

  if (response.status === 401 && refreshToken) {
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (refreshResponse.ok) {
      const refreshText = await refreshResponse.text();
      let refreshData: AuthPayload;
      try {
        refreshData = JSON.parse(refreshText) as AuthPayload;
      } catch {
        refreshData = { message: refreshText };
      }

      const auth = resolveAuthPayload(refreshData);
      const retryHeaders = new Headers(headers);
      retryHeaders.set('Authorization', `Bearer ${auth.access_token}`);
      if (auth.business?.id) {
        retryHeaders.set('X-Business-ID', auth.business.id);
      }

      response = await fetch(backendUrl, {
        method: 'GET',
        headers: retryHeaders,
        redirect: 'manual',
      });

      if (response.status === 401) {
        const expiredResponse = NextResponse.json(
          { message: 'Session expired. Please sign in again.' },
          { status: 401 }
        );
        return clearAuthCookies(expiredResponse);
      }

      const products = await readProductsPayload(response);
      const { limit, offset } = parsePagination(req.nextUrl.searchParams);
      const total = products.length;
      const data = products.slice(offset, offset + limit);

      const paginatedResponse = NextResponse.json({
        data,
        meta: {
          total,
          limit,
          offset,
          total_pages: total > 0 ? Math.ceil(total / limit) : 0,
        },
      });

      return setAuthCookies(paginatedResponse, {
        accessToken: auth.access_token,
        refreshToken: auth.refresh_token,
        businessId: auth.business?.id,
        accessTtlSeconds: auth.expires_in,
        refreshTtlSeconds: auth.refresh_ttl_seconds,
      });
    }

    const expiredResponse = NextResponse.json(
      { message: 'Session expired. Please sign in again.' },
      { status: 401 }
    );
    return clearAuthCookies(expiredResponse);
  }

  const products = await readProductsPayload(response);
  const { limit, offset } = parsePagination(req.nextUrl.searchParams);
  const total = products.length;
  const data = products.slice(offset, offset + limit);

  return NextResponse.json({
    data,
    meta: {
      total,
      limit,
      offset,
      total_pages: total > 0 ? Math.ceil(total / limit) : 0,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    return await fetchProducts(req);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Proxy Error', error: message }, { status: 500 });
  }
}
