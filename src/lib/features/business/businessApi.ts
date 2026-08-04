import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BillingPaymentMethodId, BillingPlanId } from '@/lib/billing/billingStorage';

export interface BusinessResponse {
  id: string;
  name: string;
  slug: string;
  currency_code: string;
  timezone: string;
  is_active: boolean;
  billing_plan_id: BillingPlanId;
  billing_payment_method_id: BillingPaymentMethodId;
  billing_apply_to_all_locations: boolean;
  billing_is_active: boolean;
  trial_expires_at: string;
  trial_days_remaining: number;
  trial_is_expired: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillingEventResponse {
  id: string;
  event_type: string;
  title: string;
  message: string;
  created_at: string;
}

export const businessApi = createApi({
  reducerPath: 'businessApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/proxy',
  }),
  tagTypes: ['Business'],
  endpoints: (builder) => ({
    getBusiness: builder.query<BusinessResponse, string>({
      query: (businessId) => `/businesses/${businessId}`,
      providesTags: (_result, _error, businessId) => [{ type: 'Business', id: businessId }],
    }),
    getBillingEvents: builder.query<BillingEventResponse[], string>({
      query: (businessId) => `/businesses/${businessId}/billing-events`,
      transformResponse: (response: { data: BillingEventResponse[] }) => response.data,
      providesTags: (_result, _error, businessId) => [{ type: 'Business', id: businessId }],
    }),
    updateBusiness: builder.mutation<
      BusinessResponse,
      {
        businessId: string;
        body: {
          name?: string | null;
          currency_code?: string | null;
          timezone?: string | null;
          billing_plan_id?: BillingPlanId | null;
          billing_payment_method_id?: BillingPaymentMethodId | null;
          billing_apply_to_all_locations?: boolean | null;
        };
      }
    >({
      query: ({ businessId, body }) => ({
        url: `/businesses/${businessId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { businessId }) => [{ type: 'Business', id: businessId }],
    }),
  }),
});

export const { useGetBusinessQuery, useGetBillingEventsQuery, useUpdateBusinessMutation } = businessApi;
