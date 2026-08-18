import { createApi } from '@reduxjs/toolkit/query/react';
import {
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  ListCustomersParams,
} from '@/types/customer';
import { PaginatedListResponse } from '@/types/pagination';
import { createReauthBaseQuery } from '@/lib/api/baseQuery';

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: createReauthBaseQuery('/api/proxy'),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], ListCustomersParams>({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.search) qs.set('search', params.search);
        const query = qs.toString();
        return `/customers${query ? `?${query}` : ''}`;
      },
      transformResponse: (response: { data: Customer[] }) => response.data,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Customer' as const, id })), { type: 'Customer', id: 'LIST' }]
          : [{ type: 'Customer', id: 'LIST' }],
    }),

    getPaginatedCustomers: builder.query<
      PaginatedListResponse<Customer>,
      ListCustomersParams & { limit: number; offset: number }
    >({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params.search) qs.set('search', params.search);
        qs.set('limit', String(params.limit));
        qs.set('offset', String(params.offset));
        return `/customers/paginated?${qs.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Customer' as const, id })), { type: 'Customer', id: 'LIST' }]
          : [{ type: 'Customer', id: 'LIST' }],
    }),

    getCustomerById: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }],
    }),

    createCustomer: builder.mutation<Customer, CreateCustomerPayload>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),

    updateCustomer: builder.mutation<Customer, { id: string; data: UpdateCustomerPayload }>({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),

    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetPaginatedCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;

