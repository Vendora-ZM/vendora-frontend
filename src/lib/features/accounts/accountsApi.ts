import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Account {
  membership_id: string;
  user_id: string;
  email: string;
  phone?: string | null;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  role_id: string;
  role_name: string;
  location_ids: string[];
  location_names: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  is_system: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  code: string;
  description?: string | null;
}

export interface Invitation {
  id: string;
  business_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role_id: string;
  role_name: string;
  location_ids: string[];
  expires_at: string;
  accepted_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string | null;
  permission_codes: string[];
}

export type UpdateRolePayload = CreateRolePayload;

export interface CreateInvitationPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role_id: string;
  location_ids: string[];
}

export interface UpdateAccountPayload {
  role_id: string;
  location_ids: string[];
}

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/proxy',
});

function arrayOrEmpty<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export const accountsApi = createApi({
  reducerPath: 'accountsApi',
  baseQuery,
  tagTypes: ['Account', 'Role', 'Permission', 'Invitation'],
  endpoints: (builder) => ({
    getAccounts: builder.query<Account[], void>({
      query: () => '/accounts',
      transformResponse: (response: { data: Account[] }) =>
        arrayOrEmpty(response.data).map((account) => ({
          ...account,
          location_ids: arrayOrEmpty(account.location_ids),
          location_names: arrayOrEmpty(account.location_names),
        })),
      providesTags: (result) =>
        result
          ? [...result.map(({ membership_id }) => ({ type: 'Account' as const, id: membership_id })), { type: 'Account', id: 'LIST' }]
          : [{ type: 'Account', id: 'LIST' }],
    }),
    getRoles: builder.query<Role[], void>({
      query: () => '/accounts/roles',
      transformResponse: (response: { data: Role[] }) =>
        arrayOrEmpty(response.data).map((role) => ({
          ...role,
          permissions: arrayOrEmpty(role.permissions),
        })),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Role' as const, id })), { type: 'Role', id: 'LIST' }]
          : [{ type: 'Role', id: 'LIST' }],
    }),
    getPermissions: builder.query<Permission[], void>({
      query: () => '/accounts/permissions',
      transformResponse: (response: { data: Permission[] }) => arrayOrEmpty(response.data),
      providesTags: [{ type: 'Permission', id: 'LIST' }],
    }),
    getInvitations: builder.query<Invitation[], void>({
      query: () => '/accounts/invitations',
      transformResponse: (response: { data: Invitation[] }) =>
        arrayOrEmpty(response.data).map((invitation) => ({
          ...invitation,
          location_ids: arrayOrEmpty(invitation.location_ids),
        })),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Invitation' as const, id })), { type: 'Invitation', id: 'LIST' }]
          : [{ type: 'Invitation', id: 'LIST' }],
    }),
    createRole: builder.mutation<Role, CreateRolePayload>({
      query: (body) => ({
        url: '/accounts/roles',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Role) => ({
        ...response,
        permissions: arrayOrEmpty(response.permissions),
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    updateRole: builder.mutation<Role, { id: string; body: UpdateRolePayload }>({
      query: ({ id, body }) => ({
        url: `/accounts/roles/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: Role) => ({
        ...response,
        permissions: arrayOrEmpty(response.permissions),
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    createInvitation: builder.mutation<Invitation, CreateInvitationPayload>({
      query: (body) => ({
        url: '/accounts/invitations',
        method: 'POST',
        body,
      }),
      transformResponse: (response: Invitation) => ({
        ...response,
        location_ids: arrayOrEmpty(response.location_ids),
      }),
      invalidatesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),
    updateAccount: builder.mutation<Account, { id: string; body: UpdateAccountPayload }>({
      query: ({ id, body }) => ({
        url: `/accounts/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: Account) => ({
        ...response,
        location_ids: arrayOrEmpty(response.location_ids),
        location_names: arrayOrEmpty(response.location_names),
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGetInvitationsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useCreateInvitationMutation,
  useUpdateAccountMutation,
} = accountsApi;
