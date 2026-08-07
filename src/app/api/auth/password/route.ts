import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookies, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth/sessionCookies';
import { getBackendApiUrl } from '@/lib/config/backend';
import { resolveAuthPayload, type AuthPayload } from '@/lib/auth/authPayload';

const API_URL = getBackendApiUrl();

async function forwardPasswordChange(token: string, body: unknown) {
  return fetch(`${API_URL}/auth/password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (accessToken) {
      const response = await forwardPasswordChange(accessToken, body);
      const text = await response.text();

      if (response.status !== 401) {
        return new NextResponse(text, {
          status: response.status,
          headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' },
        });
      }
    }

    if (refreshToken) {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = (await refreshResponse.json()) as AuthPayload;
        const auth = resolveAuthPayload(refreshData);
        const retryResponse = await forwardPasswordChange(auth.access_token, body);
        const retryText = await retryResponse.text();

        if (retryResponse.status === 401) {
          const expiredResponse = NextResponse.json(
            { message: 'Session expired. Please sign in again.' },
            { status: 401 }
          );
          return clearAuthCookies(expiredResponse);
        }

        return new NextResponse(retryText, {
          status: retryResponse.status,
          headers: { 'Content-Type': retryResponse.headers.get('content-type') ?? 'application/json' },
        });
      }
    }

    const expiredResponse = NextResponse.json(
      { message: 'Session expired. Please sign in again.' },
      { status: 401 }
    );
    return clearAuthCookies(expiredResponse);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal server error', error: message }, { status: 500 });
  }
}
