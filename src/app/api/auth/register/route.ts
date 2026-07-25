import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth/sessionCookies';
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      return NextResponse.json(data, { status: response.status });
    }

    // Success! Extract tokens
    const auth = data.data ?? data;
    const { access_token, refresh_token, expires_in, business } = auth;

    const res = NextResponse.json({ success: true, business });

    return setAuthCookies(res, {
      accessToken: access_token,
      refreshToken: refresh_token,
      businessId: business?.id,
      accessTtlSeconds: typeof expires_in === 'number' ? expires_in : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal server error', error: message }, { status: 500 });
  }
}


