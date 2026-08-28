import { createApi } from '@reduxjs/toolkit/query/react';
import { createReauthBaseQuery } from '@/lib/api/baseQuery';
import { CreateSupplierPayload, Supplier, UpdateSupplierPayload } from '@/types/supplier';

function unwrapApiData<T>(response: T | { data: T }): T {
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as { data: T }).data
    : response;
}

function normalizeSupplier(supplier: Partial<Supplier>): Supplier {
  return {
    id: supplier.id ?? '',
    business_id: supplier.business_id ?? '',
    name: supplier.name ?? '',
    contact_name: supplier.contact_name ?? null,
    email: supplier.email ?? null,
    phone: supplier.phone ?? null,
    address_line1: supplier.address_line1 ?? null,
    address_line2: supplier.address_line2 ?? null,
    city: supplier.city ?? null,
    state: supplier.state ?? null,
    postal_code: supplier.postal_code ?? null,
    country_code: supplier.country_code ?? 'ZM',
    service_areas: Array.isArray(supplier.service_areas) ? supplier.service_areas : [],
    supplied_products: Array.isArray(supplier.supplied_products) ? supplier.supplied_products : [],
    operating_days: supplier.operating_days ?? null,
    operating_hours: supplier.operating_hours ?? null,
    lead_time: supplier.lead_time ?? null,
    payment_terms: supplier.payment_terms ?? null,
    notes: supplier.notes ?? null,
    is_active: supplier.is_active ?? true,
    created_at: supplier.created_at ?? '',
    updated_at: supplier.updated_at ?? '',
  };
}

export const suppliersApi = createApi({
  reducerPath: 'suppliersApi',
  baseQuery: createReauthBaseQuery('/api/proxy'),
  tagTypes: ['Supplier'],
  endpoints: (builder) => ({
    getSuppliers: builder.query<Supplier[], void>({
      query: () => '/suppliers',
      transformResponse: (response: Supplier[] | { data: Supplier[] }) => unwrapApiData(response).map(normalizeSupplier),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Supplier' as const, id })), { type: 'Supplier', id: 'LIST' }]
          : [{ type: 'Supplier', id: 'LIST' }],
    }),

    getSupplierById: builder.query<Supplier, string>({
      query: (id) => `/suppliers/${id}`,
      transformResponse: (response: Supplier | { data: Supplier }) => normalizeSupplier(unwrapApiData(response)),
      providesTags: (_result, _error, id) => [{ type: 'Supplier', id }],
    }),

    createSupplier: builder.mutation<Supplier, CreateSupplierPayload>({
      query: (body) => ({
        url: '/suppliers',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Supplier | { data: Supplier }) => normalizeSupplier(unwrapApiData(response)),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),

    updateSupplier: builder.mutation<Supplier, { id: string; data: UpdateSupplierPayload }>({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: Supplier | { data: Supplier }) => normalizeSupplier(unwrapApiData(response)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),

    deleteSupplier: builder.mutation<void, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
