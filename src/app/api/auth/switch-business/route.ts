import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from '@/lib/auth/sessionCookies';
import { getBackendApiUrl } from '@/lib/config/backend';
import { resolveAuthPayload, type AuthPayload } from '@/lib/auth/authPayload';

const API_URL = getBackendApiUrl();

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      return NextResponse.json({ message: 'Access token missing' }, { status: 401 });
    }

    const body = await req.json();
    const response = await fetch(`${API_URL}/auth/switch-business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: AuthPayload;
    try {
      data = JSON.parse(text) as AuthPayload;
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      const res = NextResponse.json(data, { status: response.status });
      return response.status === 401 ? clearAuthCookies(res) : res;
    }

    const auth = resolveAuthPayload(data);
    const res = NextResponse.json({ success: true, business: auth.business });

    return setAuthCookies(res, {
      accessToken: auth.access_token,
      refreshToken: auth.refresh_token,
      businessId: auth.business?.id,
      accessTtlSeconds: auth.expires_in,
      refreshTtlSeconds: auth.refresh_ttl_seconds,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal server error', error: message }, { status: 500 });
  }
}
