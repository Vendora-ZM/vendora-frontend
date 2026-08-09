import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query';
import { logout } from '@/lib/features/auth/authSlice';

function isUnauthorized(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'status' in error && (error as { status?: number | string }).status === 401);
}

export function createReauthBaseQuery(baseUrl: string) {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    credentials: 'include',
  });

  return async (
    request: string | FetchArgs,
    api: BaseQueryApi,
    extraOptions: unknown
  ) => {
    let result = await baseQuery(request, api, extraOptions);

    if (!result.error || !isUnauthorized(result.error)) {
      return result;
    }

    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (refreshResponse.ok) {
      return baseQuery(request, api, extraOptions);
    }

    if (refreshResponse.status === 401) {
      api.dispatch(logout());
    }

    return result;
  };
}
