import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Location } from '@/types/location';

const BASE_URL = '/api/proxy';

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
  }),
});

export const { useGetLocationsQuery } = locationsApi;
