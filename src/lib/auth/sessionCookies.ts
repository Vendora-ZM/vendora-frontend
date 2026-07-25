import { NextResponse } from 'next/server';

export const ACCESS_TOKEN_COOKIE = 'vendora_access_token';
export const REFRESH_TOKEN_COOKIE = 'vendora_refresh_token';
export const BUSINESS_ID_COOKIE = 'vendora_business_id';

const isProduction = process.env.NODE_ENV === 'production';

function getCookieBaseOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/',
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
  };
}

export function setAuthCookies(
  response: NextResponse,
  payload: {
    accessToken: string;
    refreshToken?: string;
    businessId?: string;
    accessTtlSeconds?: number;
    refreshTtlSeconds?: number;
  }
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, payload.accessToken, {
    ...getCookieBaseOptions(payload.accessTtlSeconds),
  });

  if (payload.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, payload.refreshToken, {
      ...getCookieBaseOptions(payload.refreshTtlSeconds ?? 60 * 60 * 24 * 7),
    });
  }

  if (payload.businessId) {
    response.cookies.set(BUSINESS_ID_COOKIE, payload.businessId, {
      ...getCookieBaseOptions(60 * 60 * 24 * 7),
    });
  }

  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    ...getCookieBaseOptions(0),
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    ...getCookieBaseOptions(0),
  });
  response.cookies.set(BUSINESS_ID_COOKIE, '', {
    ...getCookieBaseOptions(0),
  });

  return response;
}
