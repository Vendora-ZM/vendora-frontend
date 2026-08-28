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

const QUICK_NAV_LINKS = [
  { href: '/dashboard', label: 'Home', exact: true },
  { href: '/dashboard/pos', label: 'POS', exact: false },
  { href: '/dashboard/sales', label: 'Sales', exact: false },
  { href: '/dashboard/products', label: 'Products', exact: false },
  { href: '/dashboard/orders', label: 'Orders', exact: false },
  { href: '/dashboard/suppliers', label: 'Suppliers', exact: false },
  { href: '/dashboard/analytics', label: 'Analytics', exact: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const authState = useAppSelector((state) => state.auth);
  const { data: me, error: meError } = useGetMeQuery(undefined, {
    skip: !sessionReady,
  });
  const { data: business, error: businessError } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !sessionReady || !me?.business_id,
  });
  useEffect(() => {
    let cancelled = false;

    const refreshSession = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          dispatch(logout());
          router.replace('/login');
        }
      } catch {
        // If refresh fails because the network is down, keep the current session state
        // and let the regular protected queries handle recovery when the connection returns.
      } finally {
        if (!cancelled) {
          setSessionReady(true);
        }
      }
    };

    refreshSession();

    return () => {
      cancelled = true;
    };
  }, [dispatch, router]);

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
  const showBillingGate = false;
  const userName = useMemo(
    () => `${me?.first_name ?? ''} ${me?.last_name ?? ''}`.trim() || authState.userName || 'Signed-in user',
    [authState.userName, me]
  );
  const email = me?.email ?? authState.email ?? '';
  const showQuickNav = pathname !== '/dashboard';
  const isQuickNavActive = (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const avatarInitials = useMemo(() => {
    const parts = (userName || '').split(' ').filter(Boolean);
    if (parts.length === 0) {
      return 'M';
    }
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }, [userName]);

  if (!sessionReady) {
    return (
      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <main className={styles.content}>
            <section className={styles.billingGate}>
              <div className={styles.gateCard}>
                <span className={styles.gateKicker}>Restoring session</span>
                <h1 className={styles.gateTitle}>Keeping you signed in.</h1>
                <p className={styles.gateText}>
                  Vendora is refreshing your session before loading the dashboard so you do not get bounced back
                  to the login screen during normal use.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

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
                <span className={styles.accountName}>{userName}</span>
                {email ? <span className={styles.emailLine}>{email}</span> : null}
              </div>
            </div>

            <DashboardNotificationsMenu />
          </div>
        </header>

        <main className={styles.content}>
          {showQuickNav ? (
            <nav className={styles.quickNavShell} aria-label="Quick page navigation">
              <div className={styles.quickNavTrack}>
                {QUICK_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.quickNavLink} ${isQuickNavActive(link.href, link.exact) ? styles.quickNavLinkActive : ''}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <span className={styles.quickNavHint}>Swipe for more pages</span>
            </nav>
          ) : null}

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
