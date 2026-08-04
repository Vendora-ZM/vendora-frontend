'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useLogoutMutation } from '@/lib/features/auth/authApi';
import { logout } from '@/lib/features/auth/authSlice';
import { useGetBusinessQuery, useUpdateBusinessMutation } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import styles from './page.module.css';

const currencyOptions = ['USD', 'ZMW', 'GBP', 'EUR', 'KES', 'TZS', 'UGX', 'NGN'];

const timezoneOptions = [
  'Africa/Lusaka',
  'Africa/Johannesburg',
  'Africa/Nairobi',
  'Africa/Lagos',
  'Europe/London',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
];

function isUnauthorizedError(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'status' in error &&
      (error as { status?: number | string }).status === 401
  );
}

function WorkspaceProfileCard({
  businessId,
  initialName,
  initialCurrencyCode,
  initialTimezone,
  fullName,
  email,
  roleName,
  businessName,
  initial,
  onSignOut,
}: {
  businessId: string;
  initialName: string;
  initialCurrencyCode: string;
  initialTimezone: string;
  fullName: string;
  email: string;
  roleName: string;
  businessName: string;
  initial: string;
  onSignOut: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [currencyCode, setCurrencyCode] = useState(initialCurrencyCode);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [statusMessage, setStatusMessage] = useState('');
  const [updateBusiness, { isLoading: isSaving }] = useUpdateBusinessMutation();

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage('');

    try {
      const updated = await updateBusiness({
        businessId,
        body: {
          name: name.trim() || null,
          currency_code: currencyCode.trim().toUpperCase() || null,
          timezone: timezone.trim() || null,
        },
      }).unwrap();

      setName(updated.name);
      setCurrencyCode(updated.currency_code);
      setTimezone(updated.timezone);
      setStatusMessage('Workspace settings saved successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save workspace settings.';
      setStatusMessage(message);
    }
  };

  return (
    <div className={styles.grid}>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <span className={styles.cardKicker}>Business profile</span>
            <h2 className={styles.cardTitle}>Edit the company details that appear across the platform.</h2>
            <p className={styles.cardText}>
              This controls how the company is named in the dashboard, receipts, and future operational settings.
            </p>
          </div>
        </div>

        {statusMessage ? <div className={styles.notice}>{statusMessage}</div> : null}

        <form className={styles.form} onSubmit={handleSave}>
          <Input
            id="business-name"
            label="Company name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            helpText="The company name shown to staff and in the dashboard."
          />

          <div className={styles.formGrid}>
            <Select
              id="currency-code"
              label="Currency"
              value={currencyCode}
              onChange={(event) => setCurrencyCode(event.target.value)}
              helpText="Used for pricing, reporting, and sales totals."
            >
              {currencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>

            <Select
              id="timezone"
              label="Time zone"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              helpText="Used for daily summaries and report cutoffs."
            >
              {timezoneOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save workspace settings'}
            </Button>
            <Link href="/terms" className={styles.linkButton}>
              View Terms
            </Link>
          </div>
        </form>
      </section>

      <aside className={styles.sidebar}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardKicker}>My account</span>
              <h2 className={styles.cardTitle}>The person logged in is separate from the business.</h2>
              <p className={styles.cardText}>
                This is your personal login, while the business profile above is the company you are representing.
              </p>
            </div>
          </div>

          <div className={styles.profileCard}>
            <div className={styles.avatar}>{initial}</div>
            <div className={styles.profileCopy}>
              <strong>{fullName}</strong>
              <span>{email}</span>
              <span>{roleName}</span>
              <span>{businessName}</span>
            </div>
          </div>

          <div className={styles.profileActions}>
            <Button type="button" variant="outline" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardKicker}>Quick access</span>
              <h2 className={styles.cardTitle}>Move to the main operational areas faster.</h2>
            </div>
          </div>

          <div className={styles.quickLinks}>
            <Link href="/dashboard/accounts" className={styles.quickLink}>
              Employees
              <span>Manage roles, invites, and location access.</span>
            </Link>
            <Link href="/dashboard/billing" className={styles.quickLink}>
              Billing
              <span>Review plans, trial status, and payment methods.</span>
            </Link>
            <Link href="/dashboard/locations" className={styles.quickLink}>
              Locations
              <span>Keep branches organized and editable.</span>
            </Link>
            <Link href="/dashboard/products" className={styles.quickLink}>
              Products
              <span>Control the catalog and pricing.</span>
            </Link>
            <Link href="/dashboard/pos" className={styles.quickLink}>
              POS
              <span>Return to the selling screen.</span>
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const [logoutApi] = useLogoutMutation();
  const { data: me, error: meError } = useGetMeQuery();
  const { data: business, error: businessError } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });

  useEffect(() => {
    const unauthorized = isUnauthorizedError(meError) || isUnauthorizedError(businessError);

    if (unauthorized) {
      dispatch(logout());
      router.replace('/login');
    }
  }, [businessError, dispatch, meError, router]);

  const fullName = useMemo(
    () => `${me?.first_name ?? ''} ${me?.last_name ?? ''}`.trim() || authState.userName || 'Signed-in user',
    [authState.userName, me]
  );

  const roleName = me?.role_name ?? authState.roleName ?? 'Team member';
  const businessName = business?.name ?? authState.businessName ?? 'Merchant Store';
  const email = me?.email ?? authState.email ?? 'No email loaded';
  const initial = fullName ? fullName[0].toUpperCase() : 'M';

  const handleSignOut = async () => {
    try {
      await logoutApi({}).unwrap();
    } catch {
      // Clear local auth even if the backend call fails.
    }

    dispatch(logout());
    router.push('/login');
  };

  if (!business) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Settings</span>
            <h1 className={styles.title}>Workspace settings, kept simple.</h1>
            <p className={styles.subtitle}>Please wait while we load the company profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Settings</span>
          <h1 className={styles.title}>Workspace settings, kept simple.</h1>
          <p className={styles.subtitle}>
            Keep the company profile, your personal profile, and operational shortcuts in separate places so the
            workspace stays understandable.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Business</span>
            <strong className={styles.statValue}>{businessName}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Signed in as</span>
            <strong className={styles.statValue}>{fullName}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Role</span>
            <strong className={styles.statValue}>{roleName}</strong>
          </div>
        </div>
      </div>

      <WorkspaceProfileCard
        key={business.id}
        businessId={business.id}
        initialName={business.name}
        initialCurrencyCode={business.currency_code}
        initialTimezone={business.timezone}
        fullName={fullName}
        email={email}
        roleName={roleName}
        businessName={businessName}
        initial={initial}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
