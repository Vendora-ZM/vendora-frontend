import { createApi } from '@reduxjs/toolkit/query/react';
import { Sale, ListSalesParams, CreateSaleRequest, CompleteSaleRequest, UpdateSaleRequest } from '@/types/sale';
import { createReauthBaseQuery } from '@/lib/api/baseQuery';

export interface SalesMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface PaginatedSalesResponse {
  data: Sale[];
  meta: SalesMeta;
}

function unwrapApiData<T>(response: T | { data: T }): T {
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as { data: T }).data
    : response;
}

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: createReauthBaseQuery('/api/proxy'),
  tagTypes: ['Sale'],
  endpoints: (builder) => ({
    getSales: builder.query<PaginatedSalesResponse, ListSalesParams>({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.status) qs.set('status', params.status);
        if (params.location_id) qs.set('location_id', params.location_id);
        if (params.limit) qs.set('limit', String(params.limit));
        if (params.offset) qs.set('offset', String(params.offset));
        if (params.start_date) qs.set('start_date', params.start_date);
        if (params.end_date) qs.set('end_date', params.end_date);
        const query = qs.toString();
        return `/sales${query ? `?${query}` : ''}`;
      },
      transformResponse: (response: PaginatedSalesResponse) => response,
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'Sale' as const, id })), { type: 'Sale', id: 'LIST' }]
          : [{ type: 'Sale', id: 'LIST' }],
    }),

    getSaleById: builder.query<Sale, string>({
      query: (id) => `/sales/${id}`,
      transformResponse: (response: Sale | { data: Sale }) => unwrapApiData(response),
      providesTags: (_result, _error, id) => [{ type: 'Sale', id }],
    }),

    createSale: builder.mutation<Sale, CreateSaleRequest>({
      query: (body) => ({
        url: '/sales',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Sale | { data: Sale }) => unwrapApiData(response),
      invalidatesTags: [{ type: 'Sale', id: 'LIST' }],
    }),

    updateSale: builder.mutation<Sale, { id: string; data: UpdateSaleRequest }>({
      query: ({ id, data }) => ({
        url: `/sales/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: Sale | { data: Sale }) => unwrapApiData(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Sale', id },
        { type: 'Sale', id: 'LIST' },
      ],
    }),

    completeSale: builder.mutation<Sale, { id: string; data: CompleteSaleRequest }>({
      query: ({ id, data }) => ({
        url: `/sales/${id}/complete`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: Sale | { data: Sale }) => unwrapApiData(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Sale', id },
        { type: 'Sale', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetSalesQuery, useGetSaleByIdQuery, useCreateSaleMutation, useUpdateSaleMutation, useCompleteSaleMutation } = salesApi;
