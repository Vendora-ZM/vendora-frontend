'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardNotificationsMenu } from '@/components/layout/DashboardNotificationsMenu';
import { NetworkStatusBanner } from '@/components/layout/NetworkStatusBanner';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { setCredentials, logout } from '@/lib/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import styles from './layout.module.css';

function isUnauthorizedError(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'status' in error &&
      (error as { status?: number | string }).status === 401
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const authState = useAppSelector((state) => state.auth);
  const { data: me, error: meError } = useGetMeQuery();
  const { data: business, error: businessError } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const pathname = usePathname();

  useEffect(() => {
    if (me) {
      dispatch(
        setCredentials({
          businessId: me.business_id,
          permissions: me.permissions,
          userId: me.id,
          userName: `${me.first_name} ${me.last_name}`.trim(),
          email: me.email,
          roleName: me.role_name,
        })
      );
    }
  }, [dispatch, me]);

  useEffect(() => {
    if (business) {
      dispatch(
        setCredentials({
          businessId: business.id,
          permissions: me?.permissions,
          businessName: business.name,
          userId: me?.id,
          userName: `${me?.first_name ?? ''} ${me?.last_name ?? ''}`.trim() || null,
          email: me?.email,
          roleName: me?.role_name,
        })
      );
    }
  }, [business, dispatch, me]);

  useEffect(() => {
    const unauthorized = isUnauthorizedError(meError) || isUnauthorizedError(businessError);

    if (unauthorized) {
      dispatch(logout());
      router.replace('/login');
    }
  }, [businessError, dispatch, meError, router]);

  const companyName = business?.name ?? authState.businessName ?? 'Merchant Store';
  const trialState = useMemo(
    () =>
      business
        ? {
            daysRemaining: business.trial_days_remaining,
            expiresAt: business.trial_expires_at,
            isExpired: business.trial_is_expired,
            billingIsActive: business.billing_is_active,
          }
        : null,
    [business]
  );
  const isPosRoute = pathname?.startsWith('/dashboard/pos') ?? false;
  const showBillingGate = Boolean(isPosRoute && trialState?.isExpired && !trialState?.billingIsActive);
  const userName = useMemo(
    () => `${me?.first_name ?? ''} ${me?.last_name ?? ''}`.trim() || authState.userName || 'Signed-in user',
    [authState.userName, me]
  );
  const roleName = me?.role_name ?? authState.roleName ?? 'Team member';
  const email = me?.email ?? authState.email ?? '';
  const avatarInitials = useMemo(() => {
    const parts = (userName || '').split(' ').filter(Boolean);
    if (parts.length === 0) {
      return 'M';
    }
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }, [userName]);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.mainContent}>
        <header className={styles.topHeader}>
          {/* Hamburger — only visible on mobile */}
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className={styles.search}>
            <input type="text" placeholder="Search..." className={styles.searchInput} />
          </div>

          <div className={styles.headerRight}>
            <div className={styles.profile}>
              <div className={styles.avatar}>{avatarInitials}</div>
              <div className={styles.profileCopy}>
                <span className={styles.identityLabel}>Business</span>
                <span className={styles.companyName}>{companyName}</span>
                <span className={styles.identityLabel}>Signed in account</span>
                <span className={styles.userLine}>
                  {userName} · {roleName}
                </span>
                {email ? <span className={styles.emailLine}>{email}</span> : null}
              </div>
            </div>

            <DashboardNotificationsMenu />
          </div>
        </header>

        <main className={styles.content}>
          {trialState ? (
            <div className={`${styles.trialBanner} ${trialState.isExpired ? styles.trialBannerExpired : ''}`}>
              <div className={styles.trialBannerCopy}>
                <span className={styles.trialBannerKicker}>Trial status</span>
                <strong>
                  {trialState.billingIsActive
                    ? 'Billing is active.'
                    : trialState.isExpired
                      ? 'Your trial has ended.'
                    : `${trialState.daysRemaining} day${trialState.daysRemaining === 1 ? '' : 's'} left on your trial.`}
                </strong>
                <p>
                  {trialState.billingIsActive
                    ? 'The POS is unlocked and billing preferences are saved on the business profile.'
                    : trialState.isExpired
                      ? 'Review billing to restore access to the POS and keep the business active.'
                    : 'You can finish setup, review plans, and keep everything ready before the trial expires.'}
                </p>
              </div>

              <Link href="/dashboard/billing" className={styles.trialBannerLink}>
                Review billing
              </Link>
            </div>
          ) : null}

          {showBillingGate ? (
            <section className={styles.billingGate}>
              <div className={styles.gateCard}>
                <span className={styles.gateKicker}>Billing required</span>
                <h1 className={styles.gateTitle}>The POS is locked until billing is completed.</h1>
                <p className={styles.gateText}>
                  Your trial has expired, so sales are paused until a plan and payment method are saved in billing.
                </p>
                <div className={styles.gateActions}>
                  <Link href="/dashboard/billing" className={styles.gatePrimaryLink}>
                    Open billing
                  </Link>
                  <Link href="/dashboard/settings" className={styles.gateSecondaryLink}>
                    Workspace settings
                  </Link>
                </div>
              </div>
            </section>
          ) : (
            children
          )}
        </main>

        <NetworkStatusBanner />
      </div>
    </div>
  );
}
