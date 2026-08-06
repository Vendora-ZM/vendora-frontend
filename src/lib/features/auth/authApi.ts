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
    permissions?: string[];
  };
}

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  business_name: string;
  business_category: string;
  business_type: string;
  phone?: string;
  promo_code?: string;
}

interface AcceptInvitationRequest {
  email: string;
  token: string;
  password: string;
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
    acceptInvitation: builder.mutation<{ message?: string }, AcceptInvitationRequest>({
      query: (payload) => ({
        url: '/invitations/accept',
        method: 'POST',
        body: payload,
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
  useAcceptInvitationMutation,
  useLogoutMutation,
} = authApi;
