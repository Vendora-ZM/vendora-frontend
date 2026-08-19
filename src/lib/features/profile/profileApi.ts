import { createApi } from '@reduxjs/toolkit/query/react';
import { createReauthBaseQuery } from '@/lib/api/baseQuery';

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

export interface BusinessMembership {
  business_id: string;
  business_name: string;
  role_id: string;
  role_name: string;
  created_at: string;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: createReauthBaseQuery('/api/proxy'),
  tagTypes: ['Me'],
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => '/me',
      transformResponse: (response: MeResponse) => ({
        ...response,
        permissions: Array.isArray(response.permissions) ? response.permissions : [],
      }),
      providesTags: ['Me'],
    }),
    getBusinessMemberships: builder.query<BusinessMembership[], void>({
      query: () => '/me/businesses',
      transformResponse: (response: BusinessMembership[]) => (Array.isArray(response) ? response : []),
      providesTags: ['Me'],
    }),
  }),
});

export const { useGetMeQuery, useGetBusinessMembershipsQuery } = profileApi;
