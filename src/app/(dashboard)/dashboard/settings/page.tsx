'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useLogoutMutation } from '@/lib/features/auth/authApi';
import { logout } from '@/lib/features/auth/authSlice';
import { useGetBusinessQuery, useUpdateBusinessMutation } from '@/lib/features/business/businessApi';
import {
  BILLING_PAYMENT_METHODS,
  BILLING_PLANS,
  type BillingPaymentMethodId,
  type BillingPlanId,
} from '@/lib/billing/billingStorage';
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
  initialPaymentTypes,
  initialPlanId,
  initialMethodId,
  initialApplyToAllLocations,
  initialBillingIsActive,
  trialDaysRemaining,
  trialExpiresAt,
  trialIsExpired,
  fullName,
  email,
  roleName,
  businessName,
  businessSlug,
  initial,
  onSignOut,
}: {
  businessId: string;
  initialName: string;
  initialCurrencyCode: string;
  initialTimezone: string;
  initialPaymentTypes: string[];
  initialPlanId: BillingPlanId;
  initialMethodId: BillingPaymentMethodId;
  initialApplyToAllLocations: boolean;
  initialBillingIsActive: boolean;
  trialDaysRemaining: number;
  trialExpiresAt: string;
  trialIsExpired: boolean;
  fullName: string;
  email: string;
  roleName: string;
  businessName: string;
  businessSlug: string;
  initial: string;
  onSignOut: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [currencyCode, setCurrencyCode] = useState(initialCurrencyCode);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [paymentTypes, setPaymentTypes] = useState(initialPaymentTypes);
  const [paymentTypeDraft, setPaymentTypeDraft] = useState('');
  const [planId, setPlanId] = useState<BillingPlanId>(initialPlanId);
  const [paymentMethodId, setPaymentMethodId] = useState<BillingPaymentMethodId>(initialMethodId);
  const [applyToAllLocations, setApplyToAllLocations] = useState(initialApplyToAllLocations);
  const [billingIsActive, setBillingIsActive] = useState(initialBillingIsActive);
  const [statusMessage, setStatusMessage] = useState('');
  const [updateBusiness, { isLoading: isSaving }] = useUpdateBusinessMutation();
  const selectedPlan = BILLING_PLANS.find((plan) => plan.id === planId) ?? BILLING_PLANS[1];
  const selectedMethod =
    BILLING_PAYMENT_METHODS.find((method) => method.id === paymentMethodId) ?? BILLING_PAYMENT_METHODS[0];
  const expiresText = new Date(trialExpiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const addPaymentType = () => {
    const label = paymentTypeDraft.trim();
    if (!label) {
      return;
    }

    const exists = paymentTypes.some((entry) => entry.toLowerCase() === label.toLowerCase());
    if (exists) {
      setPaymentTypeDraft('');
      return;
    }

    setPaymentTypes((current) => [...current, label]);
    setPaymentTypeDraft('');
  };

  const removePaymentType = (label: string) => {
    setPaymentTypes((current) => current.filter((entry) => entry !== label));
  };

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
          payment_types: paymentTypes,
          billing_plan_id: planId,
          billing_payment_method_id: paymentMethodId,
          billing_apply_to_all_locations: applyToAllLocations,
        },
      }).unwrap();

      setName(updated.name);
      setCurrencyCode(updated.currency_code);
      setTimezone(updated.timezone);
      setPaymentTypes(updated.payment_types ?? []);
      setBillingIsActive(updated.billing_is_active);
      setStatusMessage('Workspace settings saved successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save workspace settings.';
      setStatusMessage(message);
    }
  };

  return (
    <div className={styles.pageBody}>
      <section className={styles.statusStrip}>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>Business</span>
          <strong className={styles.statusValue}>{businessName}</strong>
          <small>{businessSlug}</small>
        </div>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>Trial</span>
          <strong className={styles.statusValue}>
            {trialIsExpired ? 'Expired' : `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left`}
          </strong>
          <small>{expiresText}</small>
        </div>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>Access</span>
          <strong className={styles.statusValue}>{billingIsActive ? 'Unlocked' : 'Locked'}</strong>
          <small>{billingIsActive ? 'POS is available' : 'Billing needs attention'}</small>
        </div>
      </section>

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

            <Select
              id="billing-plan"
              label="Billing plan"
              value={planId}
              onChange={(event) => setPlanId(event.target.value as BillingPlanId)}
              helpText="Choose the plan that matches the size of the business."
            >
              {BILLING_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.priceLabel}
                </option>
              ))}
            </Select>

            <Select
              id="billing-method"
              label="Payment method"
              value={paymentMethodId}
              onChange={(event) => setPaymentMethodId(event.target.value as BillingPaymentMethodId)}
              helpText="How the business prefers to pay for Vendora."
            >
              {BILLING_PAYMENT_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </Select>
          </div>

          <div className={styles.paymentTypesCard}>
            <div className={styles.paymentTypesHeader}>
              <div>
                <span className={styles.cardKicker}>Sales payment types</span>
                <h3 className={styles.paymentTypesTitle}>What payment labels should the POS show?</h3>
                <p className={styles.cardText}>
                  Add the tender names your team actually uses. These are saved on the business profile and can later
                  power the POS payment options and reporting.
                </p>
              </div>
              <span className={styles.paymentTypesCount}>
                {paymentTypes.length} type{paymentTypes.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className={styles.paymentTypesInputRow}>
              <Input
                id="payment-type-draft"
                label="Add payment type"
                value={paymentTypeDraft}
                onChange={(event) => setPaymentTypeDraft(event.target.value)}
                placeholder="Cash, Card, Airtel Money"
                helpText="Use plain labels your staff will recognize."
              />
              <Button type="button" variant="outline" onClick={addPaymentType}>
                Add
              </Button>
            </div>

            <div className={styles.paymentTypesList}>
              {paymentTypes.length > 0 ? (
                paymentTypes.map((paymentType) => (
                  <span key={paymentType} className={styles.paymentTypeChip}>
                    {paymentType}
                    <button
                      type="button"
                      className={styles.paymentTypeRemove}
                      onClick={() => removePaymentType(paymentType)}
                      aria-label={`Remove ${paymentType}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className={styles.paymentTypesEmpty}>
                  No payment types yet. Add at least one so the POS has clear choices.
                </p>
              )}
            </div>
          </div>

          <label className={styles.checkboxRow} htmlFor="billing-apply-all">
            <input
              id="billing-apply-all"
              type="checkbox"
              checked={applyToAllLocations}
              onChange={(event) => setApplyToAllLocations(event.target.checked)}
            />
            <span>Apply billing method to all locations</span>
          </label>

          <div className={styles.preferenceSummary}>
            <div>
              <span>Selected plan</span>
              <strong>{selectedPlan.name}</strong>
            </div>
            <div>
              <span>Selected payment method</span>
              <strong>{selectedMethod.name}</strong>
            </div>
            <div>
              <span>Plan scope</span>
              <strong>{applyToAllLocations ? 'All locations' : 'Selected locations'}</strong>
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save workspace settings'}
            </Button>
            <Link href="/dashboard/billing" className={styles.linkButton}>
              Open billing
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
            <Link href="/terms" className={styles.linkButton}>
              View Terms
            </Link>
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
  const businessSlug = business?.slug ?? business?.name?.toLowerCase().replace(/\s+/g, '-') ?? 'merchant-store';
  const email = me?.email ?? authState.email ?? 'No email loaded';
  const initial = fullName ? fullName[0].toUpperCase() : 'M';
  const paymentTypes = business?.payment_types?.length ? business.payment_types : ['Cash', 'Card', 'Mobile Money'];

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
        initialPaymentTypes={paymentTypes}
        initialPlanId={business.billing_plan_id}
        initialMethodId={business.billing_payment_method_id}
        initialApplyToAllLocations={business.billing_apply_to_all_locations}
        initialBillingIsActive={business.billing_is_active}
        trialDaysRemaining={business.trial_days_remaining}
        trialExpiresAt={business.trial_expires_at}
        trialIsExpired={business.trial_is_expired}
        fullName={fullName}
        email={email}
        roleName={roleName}
        businessName={businessName}
        businessSlug={businessSlug}
        initial={initial}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
