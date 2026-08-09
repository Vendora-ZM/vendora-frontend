'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  useGetBillingEventsQuery,
  useGetBusinessQuery,
  useUpdateBusinessMutation,
} from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { logout } from '@/lib/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  BILLING_PAYMENT_METHODS,
  BILLING_PLANS,
  type BillingPaymentMethodId,
  type BillingPlanId,
} from '@/lib/billing/billingStorage';
import styles from './page.module.css';

function isUnauthorizedError(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'status' in error &&
      (error as { status?: number | string }).status === 401
  );
}

function BillingWorkspace({
  businessId,
  companyName,
  initialPlanId,
  initialMethodId,
  initialApplyToAllLocations,
  initialBillingIsActive,
  trialDaysRemaining,
  trialExpiresAt,
  trialIsExpired,
}: {
  businessId: string;
  companyName: string;
  initialPlanId: BillingPlanId;
  initialMethodId: BillingPaymentMethodId;
  initialApplyToAllLocations: boolean;
  initialBillingIsActive: boolean;
  trialDaysRemaining: number;
  trialExpiresAt: string;
  trialIsExpired: boolean;
}) {
  const [updateBusiness, { isLoading: isSaving }] = useUpdateBusinessMutation();
  const [planId, setPlanId] = useState<BillingPlanId>(initialPlanId);
  const [paymentMethodId, setPaymentMethodId] = useState<BillingPaymentMethodId>(initialMethodId);
  const [applyToAllLocations, setApplyToAllLocations] = useState(initialApplyToAllLocations);
  const [billingIsActive, setBillingIsActive] = useState(initialBillingIsActive);
  const [statusMessage, setStatusMessage] = useState('');
  const { data: billingEvents = [] } = useGetBillingEventsQuery(businessId);

  const selectedPlan = BILLING_PLANS.find((plan) => plan.id === planId) ?? BILLING_PLANS[1];
  const selectedMethod =
    BILLING_PAYMENT_METHODS.find((method) => method.id === paymentMethodId) ?? BILLING_PAYMENT_METHODS[0];
  const trialSeverity = trialIsExpired ? 'expired' : trialDaysRemaining <= 3 ? 'urgent' : trialDaysRemaining <= 7 ? 'warning' : 'normal';
  const trialCalloutClass =
    trialSeverity === 'expired'
      ? styles.trialCallout_expired
      : trialSeverity === 'urgent'
        ? styles.trialCallout_urgent
        : trialSeverity === 'warning'
          ? styles.trialCallout_warning
          : '';

  const expiresText = new Date(trialExpiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSave = async () => {
    setStatusMessage('');

    try {
      await updateBusiness({
        businessId,
        body: {
          billing_plan_id: planId,
          billing_payment_method_id: paymentMethodId,
          billing_apply_to_all_locations: applyToAllLocations,
        },
      }).unwrap();

      setBillingIsActive(true);
      setStatusMessage('Billing preferences saved to the business profile.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save billing preferences.';
      setStatusMessage(message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Billing</span>
          <h1 className={styles.title}>Keep access simple, visible, and predictable.</h1>
          <p className={styles.subtitle}>
            Manage the trial countdown, choose how you want to pay, and pick the plan that fits your business.
          </p>
        </div>

        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Business</span>
            <strong className={styles.statusValue}>{companyName}</strong>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Trial</span>
            <strong className={styles.statusValue}>
              {trialIsExpired
                ? 'Expired'
                : `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left`}
            </strong>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Expires</span>
            <strong className={styles.statusValue}>{expiresText}</strong>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Access</span>
            <strong className={styles.statusValue}>{billingIsActive ? 'Unlocked' : 'Locked'}</strong>
          </div>
        </div>
      </div>

      <div className={`${styles.trialCallout} ${trialCalloutClass}`}>
        <div>
          <span className={styles.trialCalloutLabel}>Trial countdown</span>
          <h2>
            {trialIsExpired
              ? 'Your trial has ended.'
              : `${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'} left before the POS locks.`}
          </h2>
          <p>
            {trialIsExpired
              ? 'Choose a plan and payment method now to restore sales access.'
              : `Your trial expires on ${expiresText}. Save billing details early so the POS never surprises your team.`}
          </p>
        </div>
        <Link href="/dashboard/pos" className={styles.trialCalloutLink}>
          {trialIsExpired ? 'Open payment gate' : 'Check POS access'}
        </Link>
      </div>

      {statusMessage ? <div className={styles.notice}>{statusMessage}</div> : null}

      {trialIsExpired && !billingIsActive ? (
        <div className={styles.expiredBanner}>
          <div>
            <h2>Your trial has ended.</h2>
            <p>
              To keep using Vendora, choose a plan and pay with your preferred method. The POS will remain locked until
              billing is updated.
            </p>
          </div>
          <Link href="/dashboard/pos" className={styles.expiredLink}>
            Go to payment gate
          </Link>
        </div>
      ) : null}

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardKicker}>Plan</span>
              <h2 className={styles.cardTitle}>Choose the subscription that fits.</h2>
            </div>
          </div>

          <div className={styles.planGrid}>
            {BILLING_PLANS.map((plan) => {
              const active = plan.id === planId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  className={`${styles.planCard} ${active ? styles.planCardActive : ''}`}
                  onClick={() => setPlanId(plan.id)}
                >
                  <div className={styles.planTop}>
                    <strong>{plan.name}</strong>
                    <span>{plan.priceLabel}</span>
                  </div>
                  <p>{plan.description}</p>
                  <ul className={styles.planList}>
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        <aside className={styles.sidebar}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardKicker}>Payment method</span>
                <h2 className={styles.cardTitle}>How should we collect payment?</h2>
              </div>
            </div>

            <div className={styles.methodList}>
              {BILLING_PAYMENT_METHODS.map((method) => {
                const active = method.id === paymentMethodId;
                return (
                  <button
                    key={method.id}
                    type="button"
                    className={`${styles.methodCard} ${active ? styles.methodCardActive : ''}`}
                    onClick={() => setPaymentMethodId(method.id)}
                  >
                    <strong>{method.name}</strong>
                    <span>{method.description}</span>
                    <small>{method.detail}</small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardKicker}>Store scope</span>
                <h2 className={styles.cardTitle}>Apply the selected payment method everywhere?</h2>
              </div>
            </div>

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={applyToAllLocations}
                onChange={(event) => setApplyToAllLocations(event.target.checked)}
              />
              <span>Apply to all locations</span>
            </label>

            <div className={styles.methodSummary}>
              <span>Selected plan</span>
              <strong>{selectedPlan.name}</strong>
              <span>Selected payment method</span>
              <strong>{selectedMethod.name}</strong>
            </div>

            <div className={styles.actions}>
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save billing preferences'}
              </Button>
              <Link href="/dashboard/settings" className={styles.secondaryLink}>
                Back to settings
              </Link>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardKicker}>Access</span>
                <h2 className={styles.cardTitle}>Where to go next</h2>
              </div>
            </div>

            <div className={styles.quickLinks}>
              <Link
                href="/dashboard/pos"
                className={`${styles.quickLink} ${trialIsExpired && !billingIsActive ? styles.disabledLink : ''}`}
              >
                POS
                <span>{trialIsExpired && !billingIsActive ? 'Locked until payment is completed.' : 'Ready for sales.'}</span>
              </Link>
              <Link href="/dashboard" className={styles.quickLink}>
                Overview
                <span>Return to the main workspace summary.</span>
              </Link>
              <Link href="/dashboard/settings" className={styles.quickLink}>
                Settings
                <span>Edit company details and account preferences.</span>
              </Link>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardKicker}>Activity</span>
                <h2 className={styles.cardTitle}>Recent billing history</h2>
              </div>
            </div>

            <div className={styles.historyList}>
              {billingEvents.length > 0 ? (
                billingEvents.map((event) => (
                  <article key={event.id} className={styles.historyItem}>
                    <div className={styles.historyTop}>
                      <strong>{event.title}</strong>
                      <span>
                        {new Date(event.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p>{event.message}</p>
                  </article>
                ))
              ) : (
                <div className={styles.historyEmpty}>
                  <strong>No billing activity yet.</strong>
                  <span>When you save billing preferences, the history will appear here.</span>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
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

  const companyName = business?.name ?? authState.businessName ?? 'Merchant Store';
  const planId = business?.billing_plan_id ?? 'growth';
  const paymentMethodId = business?.billing_payment_method_id ?? 'lipila_mobile_money';
  const applyToAllLocations = business?.billing_apply_to_all_locations ?? true;

  if (!business) {
    return (
      <div className={styles.page}>
        <div className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Billing</span>
            <h1 className={styles.title}>Loading billing details…</h1>
            <p className={styles.subtitle}>We are fetching the latest business profile and trial status.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BillingWorkspace
      key={business.id}
      businessId={business.id}
      companyName={companyName}
      initialPlanId={planId}
      initialMethodId={paymentMethodId}
      initialApplyToAllLocations={applyToAllLocations}
      initialBillingIsActive={business.billing_is_active}
      trialDaysRemaining={business.trial_days_remaining}
      trialExpiresAt={business.trial_expires_at}
      trialIsExpired={business.trial_is_expired}
    />
  );
}
