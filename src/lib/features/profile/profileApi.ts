import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface MeResponse {
  id: string;
  email: string;
  phone?: string | null;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email_verified_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
  business_id: string;
  role_id: string;
  role_name: string;
  permissions: string[];
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/proxy',
  }),
  tagTypes: ['Me'],
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => '/me',
      transformResponse: (response: MeResponse) => response,
      providesTags: ['Me'],
    }),
  }),
});

export const { useGetMeQuery } = profileApi;
