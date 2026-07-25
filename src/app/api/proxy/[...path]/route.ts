import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookies, setAuthCookies, REFRESH_TOKEN_COOKIE } from '@/lib/auth/sessionCookies';
import { getBackendApiUrl } from '@/lib/config/backend';

const API_URL = getBackendApiUrl();

type AuthPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  business?: { id?: string };
  message?: string;
  data?: AuthPayload;
};

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const url = `${API_URL}/${path}${req.nextUrl.search}`;

    const headers = new Headers(req.headers);
    // Remove host header to avoid issues with proxying
    headers.delete('host');
    headers.delete('origin');
    headers.delete('referer');
    headers.delete('content-length');
    headers.delete('connection');
    headers.delete('accept-encoding');
    headers.set('accept', 'application/json');

    // Attach tokens from HttpOnly cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('vendora_access_token')?.value;
    const businessId = cookieStore.get('vendora_business_id')?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    if (businessId) {
      // Depending on backend, maybe it expects X-Business-ID header, or we don't need it if JWT handles it.
      // We will attach it just in case.
      headers.set('X-Business-ID', businessId);
    }

    // Only forward bodies for non-GET/HEAD
    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const requestBody = hasBody ? await req.arrayBuffer() : undefined;

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      redirect: 'manual',
    };

    if (hasBody && requestBody) {
      fetchOptions.body = requestBody;
    }

    let response = await fetch(url, fetchOptions);

    const shouldAttemptRefresh =
      response.status === 401 &&
      Boolean(refreshToken) &&
      !path.startsWith('auth/');

    if (shouldAttemptRefresh && refreshToken) {
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

        const auth = refreshData.data ?? refreshData;
        const { access_token, refresh_token, expires_in, business } = auth;
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${access_token}`);
        if (business?.id) {
          retryHeaders.set('X-Business-ID', business.id);
        }

        const retryOptions: RequestInit = {
          method: req.method,
          headers: retryHeaders,
          redirect: 'manual',
        };

        if (hasBody && requestBody) {
          retryOptions.body = requestBody;
        }

        response = await fetch(url, retryOptions);

        if (response.status === 401) {
          const expiredResponse = NextResponse.json(
            { message: 'Session expired. Please sign in again.' },
            { status: 401 }
          );
          return clearAuthCookies(expiredResponse);
        }

        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete('content-encoding');
        const proxiedResponse = new NextResponse(response.body, {
          status: response.status,
          headers: responseHeaders,
        });

        return setAuthCookies(proxiedResponse, {
          accessToken: access_token,
          refreshToken: refresh_token,
          businessId: business?.id,
          accessTtlSeconds: typeof expires_in === 'number' ? expires_in : undefined,
        });
      }

      const expiredResponse = NextResponse.json(
        { message: 'Session expired. Please sign in again.' },
        { status: 401 }
      );
      return clearAuthCookies(expiredResponse);
    }

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding'); // let NextJS handle encoding

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Proxy Error', error: message }, { status: 500 });
  }
}

// Export supported methods
export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = handleProxy;
