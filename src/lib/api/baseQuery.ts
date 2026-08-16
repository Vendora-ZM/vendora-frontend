import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryApi, BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query';
import { logout } from '@/lib/features/auth/authSlice';

function isUnauthorized(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'status' in error && (error as { status?: number | string }).status === 401);
}

type ReauthBaseQuery = BaseQueryFn<string | FetchArgs, unknown, unknown, object, object>;

export function createReauthBaseQuery(baseUrl: string): ReauthBaseQuery {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    credentials: 'include',
  }) as unknown as ReauthBaseQuery;

  return async (
    request: string | FetchArgs,
    api: BaseQueryApi
  ) => {
    const result = await baseQuery(request, api, {});

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
      return baseQuery(request, api, {});
    }

    if (refreshResponse.status === 401) {
      api.dispatch(logout());
    }

    return result;
  };
}
