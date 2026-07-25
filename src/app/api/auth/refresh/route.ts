import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies, REFRESH_TOKEN_COOKIE } from '@/lib/auth/sessionCookies';
import { getBackendApiUrl } from '@/lib/config/backend';
import { resolveAuthPayload, type AuthPayload } from '@/lib/auth/authPayload';

const API_URL = getBackendApiUrl();

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: 'Refresh token missing' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const text = await response.text();
    let data: AuthPayload;
    try {
      data = JSON.parse(text) as AuthPayload;
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const auth = resolveAuthPayload(data);
    const res = NextResponse.json({ success: true, business: auth.business });

    return setAuthCookies(res, {
      accessToken: auth.access_token,
      refreshToken: auth.refresh_token,
      businessId: auth.business?.id,
      accessTtlSeconds: auth.expires_in,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal server error', error: message }, { status: 500 });
  }
}
