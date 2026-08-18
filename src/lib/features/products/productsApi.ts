import { createApi } from '@reduxjs/toolkit/query/react';
import {
  Product,
  Category,
  CreateCategoryPayload,
  CreateProductPayload,
  UpdateProductPayload,
  ListProductsParams,
  PaginatedProductsResponse,
} from '@/types/product';
import { createReauthBaseQuery } from '@/lib/api/baseQuery';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: createReauthBaseQuery('/api/proxy'),
  tagTypes: ['Product', 'Category'],
  endpoints: (builder) => ({
    // ─── Products ────────────────────────────────────────────────────────────
    getProducts: builder.query<Product[], ListProductsParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.set('search', params.search);
        if (params.category_id) queryParams.set('category_id', params.category_id);
        const qs = queryParams.toString();
        return `/products${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: { data: Product[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getPaginatedProducts: builder.query<
      PaginatedProductsResponse,
      ListProductsParams & { limit: number; offset: number }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.set('search', params.search);
        if (params.category_id) queryParams.set('category_id', params.category_id);
        queryParams.set('limit', String(params.limit));
        queryParams.set('offset', String(params.offset));
        return `/products/paginated?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation<Product, CreateProductPayload>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<Product, { id: string; data: UpdateProductPayload }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // ─── Categories ──────────────────────────────────────────────────────────
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      transformResponse: (response: { data: Category[] }) => response.data,
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    createCategory: builder.mutation<Category, CreateCategoryPayload>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Category) => response,
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetPaginatedProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
} = productsApi;

