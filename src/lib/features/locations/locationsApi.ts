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
  pos_terminal_limit: number;
  access_pin?: string | null;
  is_default?: boolean;
}

export interface UpdateLocationPayload {
  name?: string | null;
  code?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  pos_terminal_limit?: number | null;
  access_pin?: string | null;
  is_default?: boolean | null;
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
    updateLocation: builder.mutation<Location, { locationId: string; body: UpdateLocationPayload }>({
      query: ({ locationId, body }) => ({
        url: `/locations/${locationId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: Location) => response,
      invalidatesTags: (_result, _error, { locationId }) => [
        { type: 'Location', id: locationId },
        { type: 'Location', id: 'LIST' },
      ],
    }),
    deleteLocation: builder.mutation<void, string>({
      query: (locationId) => ({
        url: `/locations/${locationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, locationId) => [
        { type: 'Location', id: locationId },
        { type: 'Location', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} = locationsApi;
