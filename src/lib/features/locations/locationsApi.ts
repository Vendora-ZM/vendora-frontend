import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Location } from '@/types/location';

const BASE_URL = '/api/proxy';

export interface CreateLocationPayload {
  name: string;
  code?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country_code: string;
  is_default?: boolean;
}

export const locationsApi = createApi({
  reducerPath: 'locationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['Location'],
  endpoints: (builder) => ({
    getLocations: builder.query<Location[], void>({
      query: () => '/locations',
      transformResponse: (response: { data: Location[] }) => response.data,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Location' as const, id })), { type: 'Location', id: 'LIST' }]
          : [{ type: 'Location', id: 'LIST' }],
    }),
    createLocation: builder.mutation<Location, CreateLocationPayload>({
      query: (body) => ({
        url: '/locations',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Location) => response,
      invalidatesTags: [{ type: 'Location', id: 'LIST' }],
    }),
  }),
});

export const { useGetLocationsQuery, useCreateLocationMutation } = locationsApi;
