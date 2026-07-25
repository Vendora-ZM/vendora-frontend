import { NextRequest, NextResponse } from 'next/server';
import {
  clearAuthCookies,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@/lib/auth/sessionCookies';
import { getBackendApiUrl } from '@/lib/config/backend';

const API_URL = getBackendApiUrl();

export async function POST(req: NextRequest) {
  const cookieAccessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const cookieRefreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const attemptLogout = async (token: string) => {
    return fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  let logoutSucceeded = false;

  if (cookieAccessToken) {
    try {
      logoutSucceeded = (await attemptLogout(cookieAccessToken)).ok;
    } catch {
      logoutSucceeded = false;
    }
  }

  if (!logoutSucceeded && cookieRefreshToken) {
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: cookieRefreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = (await refreshResponse.json()) as {
          data?: { access_token?: string };
          access_token?: string;
        };
        const refreshed = refreshData.data ?? refreshData;
        if (refreshed.access_token) {
          logoutSucceeded = (await attemptLogout(refreshed.access_token)).ok;
        }
      }
    } catch {
      logoutSucceeded = false;
    }
  }

  const res = NextResponse.json({ success: true });
  return clearAuthCookies(res);
}
