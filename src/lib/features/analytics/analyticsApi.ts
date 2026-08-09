import { createApi } from '@reduxjs/toolkit/query/react';
import {
  SalesTrendPoint,
  TopProductRow,
  InventoryTurnoverRow,
  AnalyticsFilterParams,
} from '@/types/analytics';
import { createReauthBaseQuery } from '@/lib/api/baseQuery';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: createReauthBaseQuery('/api/proxy'),
  endpoints: (builder) => ({
    getSalesTrends: builder.query<SalesTrendPoint[], AnalyticsFilterParams>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params.from) qs.set('from', params.from);
        if (params.to) qs.set('to', params.to);
        if (params.location_id) qs.set('location_id', params.location_id);
        return `/reports/sales-trends?${qs.toString()}`;
      },
      transformResponse: (response: { data: SalesTrendPoint[] }) => response.data,
    }),
    getTopProducts: builder.query<TopProductRow[], AnalyticsFilterParams>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params.from) qs.set('from', params.from);
        if (params.to) qs.set('to', params.to);
        if (params.location_id) qs.set('location_id', params.location_id);
        if (params.limit) qs.set('limit', String(params.limit));
        return `/reports/top-products?${qs.toString()}`;
      },
      transformResponse: (response: { data: TopProductRow[] }) => response.data,
    }),
    getInventoryTurnover: builder.query<InventoryTurnoverRow[], AnalyticsFilterParams>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params.from) qs.set('from', params.from);
        if (params.to) qs.set('to', params.to);
        if (params.location_id) qs.set('location_id', params.location_id);
        if (params.limit) qs.set('limit', String(params.limit));
        return `/reports/inventory-turnover?${qs.toString()}`;
      },
      transformResponse: (response: { data: InventoryTurnoverRow[] }) => response.data,
    }),
  }),
});

export const {
  useGetSalesTrendsQuery,
  useGetTopProductsQuery,
  useGetInventoryTurnoverQuery,
} = analyticsApi;

