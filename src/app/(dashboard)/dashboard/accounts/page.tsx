"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { useAppSelector } from '@/lib/store';
import {
  useCreateRoleMutation,
  useGetAccountsQuery,
  useGetInvitationsQuery,
  useGetPermissionsQuery,
  useGetRolesQuery,
  useResendInvitationMutation,
  useUpdateRoleMutation,
  type Account,
  type Invitation,
  type Role,
} from '@/lib/features/accounts/accountsApi';
import type { Location } from '@/types/location';
import styles from './page.module.css';

const PAGE_SIZE = 8;

type TabKey = 'accounts' | 'roles' | 'invitations';

type RoleFormState = {
  name: string;
  description: string;
  permissions: string[];
};

function formatDate(value?: string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Pending';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function roleBadge(role: Role) {
  return role.is_system ? 'System role' : 'Custom role';
}

export default function AccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>('accounts');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleCurrentPage, setRoleCurrentPage] = useState(1);
  const [invitationCurrentPage, setInvitationCurrentPage] = useState(1);
  const [accountSearch, setAccountSearch] = useState('');
  const [accountStatusFilter, setAccountStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [roleForm, setRoleForm] = useState<RoleFormState>({
    name: '',
    description: '',
    permissions: [],
  });
  const [statusMessage, setStatusMessage] = useState('');

  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const authPermissions = useAppSelector((state) => state.auth.permissions);
  const canManageAccounts = Boolean(
    me?.permissions?.includes('users.manage') || authPermissions.includes('users.manage')
  );

  const { data: accounts = [], isLoading: accountsLoading } = useGetAccountsQuery(undefined, {
    skip: !canManageAccounts,
  });
  const { data: roles = [], isLoading: rolesLoading } = useGetRolesQuery(undefined, {
    skip: !canManageAccounts,
  });
  const { data: permissions = [] } = useGetPermissionsQuery(undefined, {
    skip: !canManageAccounts,
  });
  const { data: invitations = [], isLoading: invitationsLoading } = useGetInvitationsQuery(undefined, {
    skip: !canManageAccounts,
  });
  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery(undefined, {
    skip: !canManageAccounts,
  });

  const [createRole, { isLoading: creatingRole }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updatingRole }] = useUpdateRoleMutation();
  const [resendInvitation, { isLoading: resendingInvitation }] = useResendInvitationMutation();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'accounts' || tab === 'roles' || tab === 'invitations') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const selectedRole = useMemo(
    () => roles.find((role: Role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  );
  const companyName = business?.name ?? me?.business_id ?? 'Merchant Store';
  const signedInName = useMemo(
    () => `${me?.first_name ?? ''} ${me?.last_name ?? ''}`.trim() || 'Signed-in user',
    [me]
  );
  const signedInEmail = me?.email ?? 'No email loaded';
  const signedInRole = me?.role_name ?? 'Team member';
  const signedInInitial = signedInName ? signedInName[0].toUpperCase() : 'M';

  const pendingInvitations = invitations.filter((invitation: Invitation) => !invitation.accepted_at && !invitation.revoked_at).length;
  const locationNameMap = useMemo(
    () => Object.fromEntries(locations.map((location: Location) => [location.id, location.name])),
    [locations]
  );
  const filteredAccounts = useMemo(() => {
    const term = accountSearch.trim().toLowerCase();

    return accounts.filter((account: Account) => {
      const matchesSearch =
        term.length === 0 ||
        [
          account.first_name,
          account.last_name,
          account.email,
          account.role_name,
          account.membership_id,
          ...account.location_names,
        ]
          .filter(Boolean)
          .some((value: string) => value.toLowerCase().includes(term));

      const matchesStatus =
        accountStatusFilter === 'all' ||
        (accountStatusFilter === 'active' && account.is_active) ||
        (accountStatusFilter === 'inactive' && !account.is_active);

      const matchesRole = roleFilter === 'all' || account.role_id === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [accountSearch, accountStatusFilter, accounts, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedAccounts = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredAccounts.slice(start, start + PAGE_SIZE);
  }, [filteredAccounts, safeCurrentPage]);

  const startItem = filteredAccounts.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safeCurrentPage * PAGE_SIZE, filteredAccounts.length);
  const roleTotalPages = Math.max(1, Math.ceil(roles.length / PAGE_SIZE));
  const safeRoleCurrentPage = Math.min(roleCurrentPage, roleTotalPages);
  const pagedRoles = useMemo(() => {
    const start = (safeRoleCurrentPage - 1) * PAGE_SIZE;
    return roles.slice(start, start + PAGE_SIZE);
  }, [roles, safeRoleCurrentPage]);
  const roleStartItem = roles.length === 0 ? 0 : (safeRoleCurrentPage - 1) * PAGE_SIZE + 1;
  const roleEndItem = Math.min(safeRoleCurrentPage * PAGE_SIZE, roles.length);
  const invitationTotalPages = Math.max(1, Math.ceil(invitations.length / PAGE_SIZE));
  const safeInvitationCurrentPage = Math.min(invitationCurrentPage, invitationTotalPages);
  const pagedInvitations = useMemo(() => {
    const start = (safeInvitationCurrentPage - 1) * PAGE_SIZE;
    return invitations.slice(start, start + PAGE_SIZE);
  }, [invitations, safeInvitationCurrentPage]);
  const invitationStartItem = invitations.length === 0 ? 0 : (safeInvitationCurrentPage - 1) * PAGE_SIZE + 1;
  const invitationEndItem = Math.min(safeInvitationCurrentPage * PAGE_SIZE, invitations.length);

  const handleRoleToggle = (permissionCode: string) => {
    setRoleForm((current) => ({
      ...current,
      permissions: toggleValue(current.permissions, permissionCode),
    }));
  };

  const handleRoleSelect = (role: Role | null) => {
    if (!role || role.is_system) {
      setSelectedRoleId('');
      setRoleForm({ name: '', description: '', permissions: [] });
      return;
    }

    setSelectedRoleId(role.id);
    setRoleForm({
      name: role.name,
      description: role.description ?? '',
      permissions: role.permissions,
    });
  };

  const handleCreateOrUpdateRole = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage('');

    try {
      if (selectedRole && !selectedRole.is_system) {
        await updateRole({
          id: selectedRole.id,
          body: {
            name: roleForm.name,
            description: roleForm.description || null,
            permission_codes: roleForm.permissions,
          },
        }).unwrap();
        setStatusMessage(`Updated role "${roleForm.name}".`);
      } else {
        await createRole({
          name: roleForm.name,
          description: roleForm.description || null,
          permission_codes: roleForm.permissions,
        }).unwrap();
        setStatusMessage(`Created role "${roleForm.name}".`);
        setSelectedRoleId('');
        setRoleForm({ name: '', description: '', permissions: [] });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save role.';
      setStatusMessage(message);
    }
  };

  const isBusy = accountsLoading || rolesLoading || invitationsLoading || locationsLoading || meLoading;

  if (!meLoading && !canManageAccounts) {
    return (
      <div className={styles.page}>
        <section className={styles.accessDeniedCard}>
          <div className={styles.accessDeniedHeader}>
            <span className={styles.accessDeniedEyebrow}>Access required</span>
            <h1 className={styles.title}>Employees</h1>
            <p className={styles.subtitle}>
              Your current role does not include <code>users.manage</code>. That permission is assigned through roles,
              so a system administrator can add it to your role or move you to a role that already has it.
            </p>
          </div>

          <div className={styles.accessDeniedBody}>
            <p className={styles.accessDeniedLead}>What to ask for</p>
            <div className={styles.accessDeniedSteps}>
              <div className={styles.accessDeniedStep}>
                <strong>Edit your role</strong>
                <span>Add <code>users.manage</code> to the role attached to your account.</span>
              </div>
              <div className={styles.accessDeniedStep}>
                <strong>Or reassign your account</strong>
                <span>Move your user account to an existing role that already has account management access.</span>
              </div>
            </div>
          </div>

          <div className={styles.accessDeniedActions}>
            <Link className={styles.inlineLink} href="/dashboard">
              Back to dashboard
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Employees</h1>
          <p className={styles.subtitle}>
            Manage employees, roles, permissions, and location access from one focused workspace.
          </p>
          <div className={styles.headerActions}>
            <Button type="button" size="lg" variant="primary" onClick={() => router.push('/dashboard/accounts/invite')}>
              Add employee
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={() => router.push('/dashboard/loyalty/invite')}>
              Invite to Vendora
            </Button>
          </div>
        </div>

        <div className={styles.headerStats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{accounts.length}</span>
            <span className={styles.statLabel}>Employees</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{roles.length}</span>
            <span className={styles.statLabel}>Roles</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{pendingInvitations}</span>
            <span className={styles.statLabel}>Pending invites</span>
          </div>
        </div>
      </div>

      <section className={styles.contextStrip} aria-label="Workspace context">
        <div className={styles.contextCard}>
          <span className={styles.contextLabel}>Business</span>
          <strong className={styles.contextValue}>{companyName}</strong>
          <span className={styles.contextHint}>The company this dashboard is managing.</span>
        </div>
        <div className={styles.contextCard}>
          <span className={styles.contextLabel}>Signed in as</span>
          <div className={styles.contextPerson}>
            <div className={styles.contextAvatar}>{signedInInitial}</div>
            <div>
              <strong className={styles.contextValue}>{signedInName}</strong>
              <span className={styles.contextHint}>{signedInRole}</span>
              <span className={styles.contextHint}>{signedInEmail}</span>
            </div>
          </div>
        </div>
      </section>

      {statusMessage ? <div className={styles.alert}>{statusMessage}</div> : null}

      <div className={styles.tabs} role="tablist" aria-label="Employees sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'accounts'}
          className={`${styles.tab} ${activeTab === 'accounts' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          Employees
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'roles'}
          className={`${styles.tab} ${activeTab === 'roles' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          Roles
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'invitations'}
          className={`${styles.tab} ${activeTab === 'invitations' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('invitations')}
        >
          Invitations
        </button>
      </div>

      {activeTab === 'accounts' && (
        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Employee List</h2>
                <p>
                  {isBusy
                    ? 'Loading employees…'
                    : `${filteredAccounts.length} matching employee${filteredAccounts.length === 1 ? '' : 's'} of ${accounts.length} total`}
                </p>
              </div>
              <span className={styles.cardMeta}>Page {safeCurrentPage} of {totalPages}</span>
            </div>

            <div className={styles.sectionNote}>
              This table is for the people attached to the business. The business profile itself lives in Settings.
            </div>

            <div className={styles.filters}>
              <Input
                id="account-search"
                label="Search"
                placeholder="Search by name, email, role, or location"
                value={accountSearch}
                onChange={(event) => {
                  setAccountSearch(event.target.value);
                  setCurrentPage(1);
                }}
              />
              <Select
                id="account-status"
                label="Status"
                value={accountStatusFilter}
                onChange={(event) => {
                  setAccountStatusFilter(event.target.value as 'all' | 'active' | 'inactive');
                  setCurrentPage(1);
                }}
              >
                <option value="all">All employees</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </Select>
              <Select
                id="account-role"
                label="Role"
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All roles</option>
                {roles.map((role: Role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Locations</th>
                    <th>Last login</th>
                    <th>Status</th>
                    <th>Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {accountsLoading ? (
                    <tr>
                      <td className={styles.emptyCell} colSpan={6}>Loading accounts…</td>
                    </tr>
                  ) : accounts.length === 0 ? (
                    <tr>
                      <td className={styles.emptyCell} colSpan={6}>
                        No employees yet. Use Add employee to create a new team member.
                      </td>
                    </tr>
                  ) : filteredAccounts.length === 0 ? (
                    <tr>
                      <td className={styles.emptyCell} colSpan={6}>
                        No employees match the current filters.
                      </td>
                    </tr>
                  ) : (
                    pagedAccounts.map((account: Account) => (
                      <tr key={account.membership_id} className={account.user_id === me?.id ? styles.currentRow : ''}>
                        <td>
                          <div className={styles.accountCopy}>
                            <Link className={styles.accountName} href={`/dashboard/accounts/${account.membership_id}`}>
                              {account.first_name} {account.last_name}
                            </Link>
                            {account.user_id === me?.id ? (
                              <span className={styles.youBadge}>This is you</span>
                            ) : null}
                            <span className={styles.accountHint}>{account.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.roleCell}>
                            <span className={styles.roleName}>{account.role_name}</span>
                            <span className={styles.roleHint}>{account.role_id}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.locationPills}>
                              {(account.location_names ?? []).length > 0 ? (
                                (account.location_names ?? []).map((locationName: string) => (
                                  <span key={locationName} className={styles.pill}>{locationName}</span>
                                ))
                            ) : (
                              <span className={styles.muted}>No location access</span>
                            )}
                          </div>
                        </td>
                        <td>{formatDate(account.last_login_at)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${account.is_active ? styles.statusActive : styles.statusInactive}`}>
                            {account.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className={styles.actionCell}>
                          <Link className={styles.profileLink} href={`/dashboard/accounts/${account.membership_id}`}>
                            View profile
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!accountsLoading && filteredAccounts.length > 0 ? (
              <div className={styles.pagination}>
                <div className={styles.paginationSummary}>
                  Showing {startItem} to {endItem} of {filteredAccounts.length}
                </div>
                <div className={styles.paginationControls}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safeCurrentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className={styles.pageNumbers} aria-label="Pagination pages">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page: number) => (
                      <button
                        key={page}
                        type="button"
                        className={`${styles.pageNumber} ${page === safeCurrentPage ? styles.pageNumberActive : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={safeCurrentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <aside className={styles.sidebar}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Quick actions</h2>
                  <p>Jump to the employee invite page or the loyalty referral page.</p>
                </div>
              </div>

              <div className={styles.quickActionList}>
                <div className={styles.quickActionCard}>
                  <div>
                    <strong>Add employee</strong>
                    <p>Invite a team member to this business with role and location access.</p>
                  </div>
                  <Button type="button" variant="primary" size="sm" onClick={() => router.push('/dashboard/accounts/invite')}>
                    Add employee
                  </Button>
                </div>
                <div className={styles.quickActionCard}>
                  <div>
                    <strong>Invite to Vendora</strong>
                    <p>Open the loyalty page for business referral signups and promo sharing.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => router.push('/dashboard/loyalty/invite')}>
                    Open loyalty page
                  </Button>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className={styles.grid}>
          <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>Role directory</h2>
                  <p>View existing roles and open a custom role to edit its permissions.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => router.push('/dashboard/accounts/roles/new')}>
                  Create role
                </Button>
              </div>

            <div className={styles.sectionNote}>
              Roles control what a person can do in the workspace. They are separate from the company profile and
              from the business-wide settings.
            </div>

            <div className={styles.roleList}>
              {rolesLoading ? (
                <p className={styles.emptyCell}>Loading roles…</p>
              ) : roles.length === 0 ? (
                <p className={styles.emptyCell}>No roles found.</p>
              ) : (
                pagedRoles.map((role: Role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`${styles.roleRow} ${selectedRoleId === role.id ? styles.roleRowActive : ''}`}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className={styles.roleRowMain}>
                      <span className={styles.roleRowName}>{role.name}</span>
                      <span className={styles.roleRowBadge}>{roleBadge(role)}</span>
                    </div>
                    <div className={styles.roleRowFooter}>
                      <span>{role.permissions.length} permissions</span>
                      <span>{role.description || 'No description provided'}</span>
                    </div>
                  </button>
                  ))
              )}
            </div>

            {!rolesLoading && roles.length > 0 ? (
              <div className={styles.pagination}>
                <div className={styles.paginationSummary}>
                  Showing {roleStartItem} to {roleEndItem} of {roles.length}
                </div>
                <div className={styles.paginationControls}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRoleCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safeRoleCurrentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className={styles.pageNumbers} aria-label="Role pages">
                    {Array.from({ length: roleTotalPages }, (_, index) => index + 1).map((page: number) => (
                      <button
                        key={page}
                        type="button"
                        className={`${styles.pageNumber} ${page === safeRoleCurrentPage ? styles.pageNumberActive : ''}`}
                        onClick={() => setRoleCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRoleCurrentPage((page) => Math.min(roleTotalPages, page + 1))}
                    disabled={safeRoleCurrentPage === roleTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <aside className={styles.sidebar}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>{selectedRole ? 'Edit role' : 'Role details'}</h2>
                  <p>
                    {selectedRole
                      ? selectedRole.is_system
                        ? 'System roles are read-only.'
                        : 'Update the custom role name, description, and permissions.'
                      : 'Select a role to edit it, or create a new role on its own page.'}
                  </p>
                </div>

                {selectedRole ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => handleRoleSelect(null)}>
                    New role
                  </Button>
                ) : (
                  <Button type="button" variant="primary" size="sm" onClick={() => router.push('/dashboard/accounts/roles/new')}>
                    Create role
                  </Button>
                )}
              </div>

              {selectedRole ? (
                <form className={styles.form} onSubmit={handleCreateOrUpdateRole}>
                  <Input
                    id="role-name"
                    label="Role name"
                    value={roleForm.name}
                    onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))}
                    disabled={Boolean(selectedRole?.is_system)}
                    required
                  />

                  <Textarea
                    id="role-description"
                    label="Description"
                    value={roleForm.description}
                    onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))}
                    disabled={Boolean(selectedRole?.is_system)}
                  />

                  <div className={styles.permissionCard}>
                    <div className={styles.multiSelectHeader}>
                      <div>
                        <label className={styles.label}>Permissions</label>
                        <p className={styles.helperText}>Assign one or more capabilities to this role.</p>
                      </div>
                    </div>

                    <div className={styles.checkboxGrid}>
                      {permissions.map((permission: { code: string; description?: string | null }) => (
                        <label key={permission.code} className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            checked={roleForm.permissions.includes(permission.code)}
                            onChange={() => handleRoleToggle(permission.code)}
                            disabled={Boolean(selectedRole?.is_system)}
                          />
                          <span>
                            <strong>{permission.code}</strong>
                            {permission.description ? <small>{permission.description}</small> : null}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" disabled={creatingRole || updatingRole || Boolean(selectedRole?.is_system)}>
                    {creatingRole || updatingRole ? 'Saving role…' : 'Update role'}
                  </Button>
                </form>
              ) : (
                <div className={styles.form}>
                  <div className={styles.sectionNote}>
                    Create new roles on a dedicated page so you can keep this tab focused on browsing and editing roles.
                  </div>
                  <Button type="button" variant="primary" onClick={() => router.push('/dashboard/accounts/roles/new')}>
                    Open create role page
                  </Button>
                </div>
              )}
            </section>
          </aside>
        </div>
      )}

      {activeTab === 'invitations' && (
        <div className={styles.grid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Employee invites</h2>
                <p>Track employee invitations, when they expire, and whether they have been accepted.</p>
              </div>
            </div>

            <div className={styles.sectionNote}>
              These invitations belong to employees joining the business. Loyalty referrals live on the Vendora page.
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Locations</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invitationsLoading ? (
                    <tr>
                      <td className={styles.emptyCell} colSpan={6}>Loading invitations…</td>
                    </tr>
                  ) : invitations.length === 0 ? (
                    <tr>
                      <td className={styles.emptyCell} colSpan={6}>
                        No invitations yet. Use Add employee to create a new team member.
                      </td>
                    </tr>
                  ) : (
                    pagedInvitations.map((invitation: Invitation) => {
                      const status = invitation.revoked_at
                        ? 'Revoked'
                        : invitation.accepted_at
                        ? 'Accepted'
                          : 'Pending';
                      const canResend = status === 'Pending';

                      return (
                        <tr key={invitation.id}>
                          <td>
                            <div className={styles.accountCopy}>
                              <span className={styles.accountName}>
                                {invitation.first_name} {invitation.last_name}
                              </span>
                              <span className={styles.accountHint}>{invitation.email}</span>
                              {invitation.promo_code ? (
                                <span className={styles.accountHint}>Promo code: {invitation.promo_code}</span>
                              ) : null}
                            </div>
                          </td>
                          <td>{invitation.role_name}</td>
                          <td>
                            <div className={styles.locationPills}>
                              {invitation.location_ids.length > 0 ? (
                                invitation.location_ids.map((locationId: string) => (
                                  <span key={locationId} className={styles.pill}>{locationNameMap[locationId] ?? locationId}</span>
                                ))
                              ) : (
                                <span className={styles.muted}>No location access</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${status === 'Accepted' ? styles.statusActive : styles.statusInactive}`}>
                              {status}
                            </span>
                          </td>
                          <td>{formatDateTime(invitation.expires_at)}</td>
                          <td className={styles.actionCell}>
                            {canResend ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await resendInvitation({ id: invitation.id }).unwrap();
                                    setStatusMessage(`Invitation resent to ${invitation.email}.`);
                                  } catch (error) {
                                    const message = error instanceof Error ? error.message : 'Unable to resend invitation.';
                                    setStatusMessage(message);
                                  }
                                }}
                                disabled={resendingInvitation}
                              >
                                {resendingInvitation ? 'Resending…' : 'Resend email'}
                              </Button>
                            ) : (
                              <span className={styles.muted}>No action</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!invitationsLoading && invitations.length > 0 ? (
              <div className={styles.pagination}>
                <div className={styles.paginationSummary}>
                  Showing {invitationStartItem} to {invitationEndItem} of {invitations.length}
                </div>
                <div className={styles.paginationControls}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInvitationCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safeInvitationCurrentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className={styles.pageNumbers} aria-label="Invitation pages">
                    {Array.from({ length: invitationTotalPages }, (_, index) => index + 1).map((page: number) => (
                      <button
                        key={page}
                        type="button"
                        className={`${styles.pageNumber} ${page === safeInvitationCurrentPage ? styles.pageNumberActive : ''}`}
                        onClick={() => setInvitationCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInvitationCurrentPage((page) => Math.min(invitationTotalPages, page + 1))}
                    disabled={safeInvitationCurrentPage === invitationTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
