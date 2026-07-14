import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  business?: {
    id: string;
    name?: string;
  };
}

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  business_name: string;
  phone?: string;
}

// All auth requests go through the Next.js local auth routes under /api/auth/...
// The custom routes read the response from the backend, set HttpOnly cookies, and return success/business.
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/auth' }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation<void, object>({
      query: () => ({
        url: '/logout',
        method: 'POST',
        body: {},
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} = authApi;
