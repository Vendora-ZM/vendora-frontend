import { createApi } from '@reduxjs/toolkit/query/react';
import {
  InventoryBalance,
  InventoryMovement,
  AdjustStockRequest,
  TransferStockRequest,
  GetBalancesParams,
  GetMovementsParams,
} from '@/types/inventory';
import { PaginatedListResponse } from '@/types/pagination';
import { createReauthBaseQuery } from '@/lib/api/baseQuery';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: createReauthBaseQuery('/api/proxy'),
  tagTypes: ['Inventory', 'Movement'],
  endpoints: (builder) => ({
    getBalances: builder.query<InventoryBalance[], GetBalancesParams>({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.location_id) qs.set('location_id', params.location_id);
        if (params.product_id) qs.set('product_id', params.product_id);
        const query = qs.toString();
        return `/inventory${query ? `?${query}` : ''}`;
      },
      transformResponse: (response: { data: InventoryBalance[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ product_id }) => ({ type: 'Inventory' as const, id: product_id })),
              { type: 'Inventory', id: 'LIST' },
            ]
          : [{ type: 'Inventory', id: 'LIST' }],
    }),

    getPaginatedBalances: builder.query<
      PaginatedListResponse<InventoryBalance>,
      GetBalancesParams & { limit: number; offset: number }
    >({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params.location_id) qs.set('location_id', params.location_id);
        if (params.product_id) qs.set('product_id', params.product_id);
        qs.set('limit', String(params.limit));
        qs.set('offset', String(params.offset));
        return `/inventory/balances/paginated${qs.toString() ? `?${qs.toString()}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ product_id }) => ({ type: 'Inventory' as const, id: product_id })),
              { type: 'Inventory', id: 'LIST' },
            ]
          : [{ type: 'Inventory', id: 'LIST' }],
    }),

    getMovements: builder.query<InventoryMovement[], GetMovementsParams>({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.location_id) qs.set('location_id', params.location_id);
        if (params.product_id) qs.set('product_id', params.product_id);
        if (params.limit) qs.set('limit', String(params.limit));
        if (params.offset) qs.set('offset', String(params.offset));
        const query = qs.toString();
        return `/inventory/movements${query ? `?${query}` : ''}`;
      },
      transformResponse: (response: { data: InventoryMovement[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Movement' as const, id })),
              { type: 'Movement', id: 'LIST' },
            ]
          : [{ type: 'Movement', id: 'LIST' }],
    }),

    getPaginatedMovements: builder.query<
      PaginatedListResponse<InventoryMovement>,
      GetMovementsParams & { limit: number; offset: number }
    >({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params.location_id) qs.set('location_id', params.location_id);
        if (params.product_id) qs.set('product_id', params.product_id);
        qs.set('limit', String(params.limit));
        qs.set('offset', String(params.offset));
        return `/inventory/movements/paginated${qs.toString() ? `?${qs.toString()}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Movement' as const, id })),
              { type: 'Movement', id: 'LIST' },
            ]
          : [{ type: 'Movement', id: 'LIST' }],
    }),

    adjustStock: builder.mutation<InventoryMovement, AdjustStockRequest>({
      query: (body) => ({
        url: '/inventory/adjustments',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { product_id }) => [
        { type: 'Inventory', id: product_id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Movement', id: 'LIST' },
      ],
    }),

    transferStock: builder.mutation<InventoryMovement[], TransferStockRequest>({
      query: (body) => ({
        url: '/inventory/transfers',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { product_id }) => [
        { type: 'Inventory', id: product_id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Movement', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetBalancesQuery,
  useGetPaginatedBalancesQuery,
  useGetMovementsQuery,
  useGetPaginatedMovementsQuery,
  useAdjustStockMutation,
  useTransferStockMutation,
} = inventoryApi;
