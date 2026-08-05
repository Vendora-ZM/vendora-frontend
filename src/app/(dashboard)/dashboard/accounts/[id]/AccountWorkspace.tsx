'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { useGetAccountsQuery, useGetInvitationsQuery, useGetRolesQuery, useUpdateAccountMutation } from '@/lib/features/accounts/accountsApi';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { useAppSelector } from '@/lib/store';
import styles from './page.module.css';

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

type AccessEditorProps = {
  account: {
    membership_id: string;
    role_id: string;
    role_name: string;
    location_ids: string[];
  };
  roles: { id: string; name: string; description?: string | null; is_system: boolean; permissions: string[] }[];
  locations: { id: string; name: string }[];
};

function AccessEditor({ account, roles, locations }: AccessEditorProps) {
  const [roleId, setRoleId] = useState(account.role_id);
  const [locationIds, setLocationIds] = useState<string[]>(account.location_ids);
  const [statusMessage, setStatusMessage] = useState('');
  const [updateAccount, { isLoading }] = useUpdateAccountMutation();

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === roleId) ?? null,
    [roles, roleId]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage('');

    try {
      const updated = await updateAccount({
        id: account.membership_id,
        body: {
          role_id: roleId,
          location_ids: locationIds,
        },
      }).unwrap();

      setRoleId(updated.role_id);
      setLocationIds(updated.location_ids);
      setStatusMessage('Account access updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save account access.';
      setStatusMessage(message);
    }
  };

  const selectAllLocations = () => {
    setLocationIds(locations.map((location) => location.id));
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>Manage access</h2>
          <p>Change the employee role and the locations this user can access.</p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Select
          id={`role-${account.membership_id}`}
          label="Role"
          value={roleId}
          onChange={(event) => setRoleId(event.target.value)}
          required
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}{role.is_system ? ' (system)' : ''}
            </option>
          ))}
        </Select>

        <div className={styles.accessSummary}>
          <span className={styles.detailLabel}>Selected role permissions</span>
          <div className={styles.pillList}>
            {selectedRole?.permissions?.length ? (
              selectedRole.permissions.map((permission) => (
                <span key={permission} className={styles.pill}>
                  {permission}
                </span>
              ))
            ) : (
              <span className={styles.muted}>No permissions available.</span>
            )}
          </div>
        </div>

        <div className={styles.multiSelectCard}>
          <div className={styles.multiSelectHeader}>
            <div>
              <span className={styles.detailLabel}>Location access</span>
              <p className={styles.helperText}>Select one or more locations this account can access.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={selectAllLocations}>
              Select all
            </Button>
          </div>

          <div className={styles.checkboxGrid}>
            {locations.length === 0 ? (
              <p className={styles.muted}>Create at least one location before editing access.</p>
            ) : (
              locations.map((location) => (
                <label key={location.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={locationIds.includes(location.id)}
                    onChange={() => setLocationIds((current) => toggleValue(current, location.id))}
                  />
                  <span>{location.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <Button type="submit" disabled={isLoading || !locationIds.length}>
            {isLoading ? 'Saving…' : 'Save changes'}
          </Button>
          {statusMessage ? <span className={styles.inlineNotice}>{statusMessage}</span> : null}
        </div>
      </form>
    </section>
  );
}

export function AccountWorkspace() {
  const params = useParams<{ id: string }>();
  const accountId = params.id;

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
  const { data: invitations = [], isLoading: invitationsLoading } = useGetInvitationsQuery(undefined, {
    skip: !canManageAccounts,
  });
  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery(undefined, {
    skip: !canManageAccounts,
  });

  const account = useMemo(
    () => accounts.find((entry) => entry.membership_id === accountId) ?? null,
    [accountId, accounts]
  );

  const role = useMemo(
    () => roles.find((entry) => entry.id === account?.role_id) ?? null,
    [account?.role_id, roles]
  );

  const accountLocations = useMemo(
    () => locations.filter((location) => account?.location_ids.includes(location.id)),
    [account?.location_ids, locations]
  );

  const relatedInvitations = useMemo(
    () => invitations.filter((invitation) => invitation.email.toLowerCase() === account?.email?.toLowerCase()),
    [account?.email, invitations]
  );
  const companyName = business?.name ?? 'Merchant Store';
  const signedInName = `${me?.first_name ?? ''} ${me?.last_name ?? ''}`.trim() || 'Signed-in user';
  const signedInRole = me?.role_name ?? 'Team member';
  const signedInEmail = me?.email ?? '';
  const isSelfAccount = Boolean(me?.id && account?.user_id && me.id === account.user_id);
  const signedInInitial = signedInName ? signedInName[0].toUpperCase() : 'M';

  if (!meLoading && !canManageAccounts) {
    return (
      <div className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Employee profile</h1>
          <p className={styles.subtitle}>
            You do not have permission to view employee details. Ask a system administrator for `users.manage` access.
          </p>
          <Link className={styles.inlineLink} href="/dashboard/accounts">
            Back to employees
          </Link>
        </section>
      </div>
    );
  }

  if (!accountsLoading && !account) {
    return (
      <div className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Employee not found</h1>
          <p className={styles.subtitle}>The selected employee could not be found in this business.</p>
          <Link className={styles.inlineLink} href="/dashboard/accounts">
            Back to employees
          </Link>
        </section>
      </div>
    );
  }

  if (!account) {
    return (
      <div className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Loading account…</h1>
          <p className={styles.subtitle}>Please wait while we load the selected profile.</p>
        </section>
      </div>
    );
  }

  const fullName = `${account.first_name} ${account.last_name}`;
  const isActive = account.is_active;
  const isBusy = accountsLoading || rolesLoading || invitationsLoading || locationsLoading || meLoading;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumbs}>
            <Link href="/dashboard/accounts">Employees</Link>
            <span>/</span>
            <span>{fullName}</span>
          </div>
          <h1 className={styles.title}>{fullName}</h1>
          <p className={styles.subtitle}>
            {account.email}
            {isSelfAccount ? ' · this is your own login' : ''}
          </p>
        </div>

        <div className={styles.headerStats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{role?.name ?? account.role_name ?? 'No role'}</span>
            <span className={styles.statLabel}>Role</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{accountLocations.length}</span>
            <span className={styles.statLabel}>Locations</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{relatedInvitations.length}</span>
            <span className={styles.statLabel}>Invites</span>
          </div>
        </div>
      </div>

      <section className={styles.contextStrip} aria-label="Workspace context">
        <div className={styles.contextCard}>
          <span className={styles.contextLabel}>Business</span>
          <strong className={styles.contextValue}>{companyName}</strong>
          <span className={styles.contextHint}>The workspace this employee belongs to.</span>
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

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Employee details</h2>
              <p>Core employee information for this team member.</p>
            </div>
            {isSelfAccount ? <span className={styles.selfBadge}>Your account</span> : null}
          </div>

          <div className={styles.sectionNote}>
            This panel edits the employee account and access. The business profile itself is managed elsewhere.
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Full name</span>
              <span className={styles.detailValue}>{fullName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{account.email}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Phone</span>
              <span className={styles.detailValue}>{account.phone ?? 'Not provided'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Status</span>
              <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>
                {isActive ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Created</span>
              <span className={styles.detailValue}>{formatDate(account.created_at)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Last login</span>
              <span className={styles.detailValue}>{formatDateTime(account.last_login_at)}</span>
            </div>
          </div>
        </section>

        <aside className={styles.sidebar}>
          <AccessEditor key={account.membership_id} account={account} roles={roles} locations={locations} />

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Invitation history</h2>
                <p>Recent invitations tied to this email address.</p>
              </div>
            </div>

            <div className={styles.invitationList}>
              {relatedInvitations.length ? (
                relatedInvitations.map((invitation) => {
                  const status = invitation.revoked_at
                    ? 'Revoked'
                    : invitation.accepted_at
                      ? 'Accepted'
                      : 'Pending';

                  return (
                    <div key={invitation.id} className={styles.invitationCard}>
                      <div className={styles.invitationTop}>
                        <strong>{invitation.role_name}</strong>
                        <span className={`${styles.statusBadge} ${status === 'Accepted' ? styles.statusActive : styles.statusInactive}`}>
                          {status}
                        </span>
                      </div>
                      <div className={styles.invitationMeta}>
                        <span>Expires {formatDateTime(invitation.expires_at)}</span>
                        <span>Created {formatDate(invitation.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <span className={styles.muted}>{isBusy ? 'Loading invitation history…' : 'No invitation history found.'}</span>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
