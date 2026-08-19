'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import {
  useCreateInvitationMutation,
  useGetRolesQuery,
  type Role,
} from '@/lib/features/accounts/accountsApi';
import type { Location } from '@/types/location';
import styles from '../page.module.css';

type InviteFormState = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleId: string;
  locationIds: string[];
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

export default function EmployeeInvitePage() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('');
  const [inviteForm, setInviteForm] = useState<InviteFormState>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleId: '',
    locationIds: [],
  });

  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const { data: roles = [] } = useGetRolesQuery(undefined, {
    skip: !me?.business_id,
  });
  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery(undefined, {
    skip: !me?.business_id,
  });
  const [createInvitation, { isLoading: creatingInvitation }] = useCreateInvitationMutation();

  const canManageAccounts = Boolean(me?.permissions?.includes('users.manage'));
  const companyName = business?.name ?? me?.business_id ?? 'Merchant Store';
  const roleOptions = useMemo(() => roles, [roles]);

  const handleInviteLocationToggle = (locationId: string) => {
    setInviteForm((current) => ({
      ...current,
      locationIds: unique(toggleValue(current.locationIds, locationId)),
    }));
  };

  const handleSelectAllLocations = () => {
    setInviteForm((current) => ({
      ...current,
      locationIds: locations.map((location: Location) => location.id),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage('');

    try {
      await createInvitation({
        email: inviteForm.email,
        first_name: inviteForm.firstName,
        last_name: inviteForm.lastName,
        phone: inviteForm.phone || null,
        role_id: inviteForm.roleId,
        promo_code: null,
        location_ids: inviteForm.locationIds,
      }).unwrap();

      setInviteForm({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        roleId: '',
        locationIds: [],
      });
      setStatusMessage('Employee invite sent successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send employee invite.';
      setStatusMessage(message);
    }
  };

  if (!meLoading && !canManageAccounts) {
    return (
      <div className={styles.page}>
        <section className={styles.accessDeniedCard}>
          <div className={styles.accessDeniedHeader}>
            <span className={styles.accessDeniedEyebrow}>Access required</span>
            <h1 className={styles.title}>Add employee</h1>
            <p className={styles.subtitle}>
              Your current role does not include <code>users.manage</code>. A system administrator can grant that
              permission or move you to a role that already has it.
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
                <span>Move your user account to an existing role that already has employee management access.</span>
              </div>
            </div>
          </div>

          <div className={styles.accessDeniedActions}>
            <Link className={styles.inlineLink} href="/dashboard/accounts">
              Back to employees
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
          <h1 className={styles.title}>Add employee</h1>
          <p className={styles.subtitle}>
            Invite someone into {companyName} with a role and location access. This page is for team members only.
          </p>
          <div className={styles.headerActions}>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/accounts')}>
              Back to employees
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/loyalty/invite')}>
              Invite to Vendora
            </Button>
          </div>
        </div>
      </div>

      {statusMessage ? <div className={styles.alert}>{statusMessage}</div> : null}

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Employee invite</h2>
              <p>Send this invite to someone who will work inside your business account.</p>
            </div>
          </div>

          <div className={styles.sectionNote}>
            This form creates a business employee account. It does not create a referral or loyalty signup.
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <Input
                id="invite-first-name"
                label="First name"
                value={inviteForm.firstName}
                onChange={(event) => setInviteForm((current) => ({ ...current, firstName: event.target.value }))}
                required
              />
              <Input
                id="invite-last-name"
                label="Last name"
                value={inviteForm.lastName}
                onChange={(event) => setInviteForm((current) => ({ ...current, lastName: event.target.value }))}
                required
              />
            </div>

            <Input
              id="invite-email"
              label="Email"
              type="email"
              value={inviteForm.email}
              onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
              required
            />

            <Input
              id="invite-phone"
              label="Phone"
              type="tel"
              value={inviteForm.phone}
              onChange={(event) => setInviteForm((current) => ({ ...current, phone: event.target.value }))}
              helpText="Optional."
            />

            <Select
              id="invite-role"
              label="Role"
              value={inviteForm.roleId}
              onChange={(event) => setInviteForm((current) => ({ ...current, roleId: event.target.value }))}
              required
            >
              <option value="">Choose a role</option>
              {roleOptions.map((role: Role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                  {role.is_system ? ' (system)' : ''}
                </option>
              ))}
            </Select>

            <div className={styles.multiSelectCard}>
              <div className={styles.multiSelectHeader}>
                <div>
                  <label className={styles.label}>Location access</label>
                  <p className={styles.helperText}>Select the locations this employee can access.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllLocations}
                  disabled={locationsLoading || locations.length === 0}
                >
                  Select all
                </Button>
              </div>

              <div className={styles.checkboxGrid}>
                {locations.length === 0 ? (
                  <p className={styles.muted}>Create at least one location before inviting employees.</p>
                ) : (
                  locations.map((location: Location) => (
                    <label key={location.id} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        checked={inviteForm.locationIds.includes(location.id)}
                        onChange={() => handleInviteLocationToggle(location.id)}
                      />
                      <span>{location.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <Button type="submit" disabled={creatingInvitation || !inviteForm.locationIds.length || !inviteForm.roleId}>
              {creatingInvitation ? 'Sending invite…' : 'Send employee invite'}
            </Button>
          </form>
        </section>

        <aside className={styles.sidebar}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>How it works</h2>
                <p>Employee invites are tied to your business, roles, and location permissions.</p>
              </div>
            </div>

            <div className={styles.quickActionList}>
              <div className={styles.quickActionCard}>
                <div>
                  <strong>Keep it internal</strong>
                  <p>This invite creates a person who works inside your business workspace.</p>
                </div>
              </div>
              <div className={styles.quickActionCard}>
                <div>
                  <strong>Need a business referral?</strong>
                  <p>Use the loyalty page if you want to invite another business to sign up on Vendora.</p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
