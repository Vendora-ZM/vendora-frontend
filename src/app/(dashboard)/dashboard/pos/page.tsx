'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { useAppSelector } from '@/lib/store';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart } from '@/components/pos/Cart';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { getApiErrorDetails, getFriendlyErrorMessage, isBillingAccessError } from '@/lib/errors/apiError';
import {
  SALES_CHANNEL_OPTIONS,
  SALES_CHANNEL_STORAGE_PREFIX,
  getRecommendedSalesChannels,
  getSalesChannelOption,
  normalizeSalesChannels,
  type SalesChannelId,
} from '@/lib/business/salesChannels';
import styles from './page.module.css';

type FlowStage = 'selection' | 'checkout';

function getInitialSalesChannels(storageKey: string, businessCategory: string) {
  if (typeof window === 'undefined') {
    return getRecommendedSalesChannels(businessCategory);
  }

  const stored = window.localStorage.getItem(storageKey);
  if (stored) {
    try {
      return normalizeSalesChannels(JSON.parse(stored));
    } catch {
      // Ignore malformed local preferences and fall back to the recommended set below.
    }
  }

  return getRecommendedSalesChannels(businessCategory);
}

function getInitialSelectedSalesChannelId(storageKey: string, enabledSalesChannels: SalesChannelId[]) {
  if (typeof window !== 'undefined') {
    const storedSelected = window.localStorage.getItem(`${storageKey}.selected`);
    if (storedSelected && enabledSalesChannels.includes(storedSelected as SalesChannelId)) {
      return storedSelected as SalesChannelId;
    }
  }

  return enabledSalesChannels[0] ?? '';
}

function PosWorkspace({
  businessId,
  businessCategory,
  paymentTypes,
}: {
  businessId: string;
  businessCategory: string;
  paymentTypes?: string[];
}) {
  const { cart } = useAppSelector((s) => s.pos);
  const [stage, setStage] = useState<FlowStage>('selection');
  const salesChannelStorageKey = `${SALES_CHANNEL_STORAGE_PREFIX}.${businessId}`;
  const [enabledSalesChannelIds] = useState<SalesChannelId[]>(() =>
    getInitialSalesChannels(salesChannelStorageKey, businessCategory)
  );
  const [selectedSalesChannelId, setSelectedSalesChannelId] = useState<SalesChannelId | ''>(() =>
    getInitialSelectedSalesChannelId(salesChannelStorageKey, enabledSalesChannelIds)
  );

  const selectedSalesChannelOption = useMemo(() => {
    const fallbackId = (enabledSalesChannelIds[0] ?? 'walk_in') as SalesChannelId;
    return getSalesChannelOption((selectedSalesChannelId || fallbackId) as SalesChannelId);
  }, [enabledSalesChannelIds, selectedSalesChannelId]);

  const handleSelectedChannelChange = (value: SalesChannelId) => {
    setSelectedSalesChannelId(value);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`${salesChannelStorageKey}.selected`, value);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>POS Checkout</h1>
          <p className={styles.subtitle}>
            {stage === 'selection'
              ? 'Pick products first, then continue to review your sale.'
              : 'Review the selected items, complete payment, and finish the sale.'}
          </p>
        </div>

        <div className={styles.stepper} aria-label="POS checkout steps">
          <span className={`${styles.step} ${stage === 'selection' ? styles.stepActive : ''}`}>1. Products</span>
          <span className={`${styles.step} ${stage === 'checkout' ? styles.stepActive : ''}`}>2. Review & Pay</span>
        </div>
      </div>

      <section className={styles.channelBar}>
        <div className={styles.channelCopy}>
          <span className={styles.channelLabel}>Sales channel</span>
          <strong>{selectedSalesChannelOption.label}</strong>
          <p>Choose how this order should be labeled before you complete payment.</p>
        </div>

        <Select
          label="Channel shown on POS"
          value={selectedSalesChannelId || enabledSalesChannelIds[0] || ''}
          onChange={(event) => handleSelectedChannelChange(event.target.value as SalesChannelId)}
        >
          {enabledSalesChannelIds.map((channelId) => {
            const option = SALES_CHANNEL_OPTIONS.find((entry) => entry.id === channelId);
            return (
              <option key={channelId} value={channelId}>
                {option?.label ?? channelId}
              </option>
            );
          })}
        </Select>
      </section>

      {stage === 'selection' ? (
        <section className={styles.selectionStage}>
          <div className={styles.selectionPanel}>
            <ProductGrid />
          </div>

          <div className={styles.selectionFooter}>
            <div className={styles.selectionMeta}>
              <strong>{cart.length}</strong>
              <span>{cart.length === 1 ? 'item selected' : 'items selected'}</span>
            </div>

            <button
              className={styles.nextBtn}
              onClick={() => setStage('checkout')}
              disabled={cart.length === 0}
            >
              Continue to Review
            </button>
          </div>
        </section>
      ) : (
        <section className={styles.checkoutStage}>
          <Cart
            initialStage={2}
            paymentTypes={paymentTypes}
            salesChannelLabel={selectedSalesChannelOption.label}
            onBackToSelection={() => setStage('selection')}
            onStartNewSale={() => setStage('selection')}
          />
        </section>
      )}
    </div>
  );
}

function PosStatusCard({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions: React.ReactNode;
}) {
  return (
    <div className={styles.stateShell}>
      <div className={styles.stateCard}>
        <span className={styles.stateBadge}>{eyebrow}</span>
        <h2 className={styles.stateTitle}>{title}</h2>
        <p className={styles.stateText}>{description}</p>
        <div className={styles.stateActions}>{actions}</div>
      </div>
    </div>
  );
}

export default function PosPage() {
  const router = useRouter();
  const { data: me, error: meError, isLoading: isMeLoading } = useGetMeQuery();
  const {
    data: business,
    error: businessError,
    isLoading: isBusinessLoading,
    refetch: refetchBusiness,
  } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const businessErrorDetails = useMemo(() => getApiErrorDetails(businessError), [businessError]);
  const businessErrorMessage = useMemo(
    () => getFriendlyErrorMessage(businessError, 'We could not load the POS right now. Please try again.'),
    [businessError]
  );
  const meErrorMessage = useMemo(
    () => getFriendlyErrorMessage(meError, 'We could not load your account right now. Please try again.'),
    [meError]
  );

  if (isMeLoading || (!me && !meError)) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>POS Checkout</h1>
            <p className={styles.subtitle}>Loading your account and business settings…</p>
          </div>
        </div>
      </div>
    );
  }

  if (meError) {
    return (
      <PosStatusCard
        eyebrow="Account error"
        title="We could not load your account"
        description={meErrorMessage}
        actions={
          <>
            <Button type="button" size="lg" variant="primary" onClick={() => router.refresh()}>
              Try again
            </Button>
            <Link href="/dashboard" className={styles.secondaryLink}>
              Go back to dashboard
            </Link>
          </>
        }
      />
    );
  }

  if (isBusinessLoading || (!business?.id && !businessErrorDetails)) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>POS Checkout</h1>
            <p className={styles.subtitle}>Loading your business and payment settings…</p>
          </div>
        </div>
      </div>
    );
  }

  if (businessErrorDetails) {
    if (isBillingAccessError(businessError)) {
      return (
        <PosStatusCard
          eyebrow="Billing locked"
          title="Billing is required to use the POS"
          description={
            businessErrorMessage ||
            'Your account needs billing enabled before sales can continue. Open Billing to restore POS access.'
          }
          actions={
            <>
              <Button type="button" size="lg" variant="primary" onClick={() => router.push('/dashboard/billing')}>
                Open Billing
              </Button>
              <Button type="button" size="lg" variant="outline" onClick={() => refetchBusiness()}>
                Try again
              </Button>
            </>
          }
        />
      );
    }

    return (
      <PosStatusCard
        eyebrow="Load error"
        title="We could not load the POS"
        description={businessErrorMessage}
        actions={
          <>
            <Button type="button" size="lg" variant="primary" onClick={() => refetchBusiness()}>
              Try again
            </Button>
            <Link href="/dashboard" className={styles.secondaryLink}>
              Go back to dashboard
            </Link>
          </>
        }
      />
    );
  }

  const currentBusiness = business;
  if (!currentBusiness) {
    return (
      <PosStatusCard
        eyebrow="Load error"
        title="We could not load the POS"
        description="The business details were not available. Please try again."
        actions={
          <>
            <Button type="button" size="lg" variant="primary" onClick={() => router.refresh()}>
              Try again
            </Button>
            <Link href="/dashboard" className={styles.secondaryLink}>
              Go back to dashboard
            </Link>
          </>
        }
      />
    );
  }

  const paymentTypes = currentBusiness.payment_types?.length ? currentBusiness.payment_types : undefined;

  return (
    <PosWorkspace
      key={currentBusiness.id}
      businessId={currentBusiness.id}
      businessCategory={currentBusiness.business_category}
      paymentTypes={paymentTypes}
    />
  );
}
