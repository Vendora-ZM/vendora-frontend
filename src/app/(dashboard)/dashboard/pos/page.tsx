'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/ui/Input';
import { useAppSelector } from '@/lib/store';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart } from '@/components/pos/Cart';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
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

export default function PosPage() {
  const [stage, setStage] = useState<FlowStage>('selection');
  const [selectedSalesChannelId, setSelectedSalesChannelId] = useState<SalesChannelId | ''>('');
  const [enabledSalesChannelIds, setEnabledSalesChannelIds] = useState<string[]>([]);
  const { cart } = useAppSelector((s) => s.pos);
  const { data: me } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const paymentTypes = business?.payment_types?.length ? business.payment_types : undefined;
  const salesChannelStorageKey = `${SALES_CHANNEL_STORAGE_PREFIX}.${business?.id ?? me?.business_id ?? 'unknown'}`;
  const selectedSalesChannelStorageKey = `${salesChannelStorageKey}.selected`;

  useEffect(() => {
    if (!business?.id) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(salesChannelStorageKey);
    const storedSelected = window.localStorage.getItem(selectedSalesChannelStorageKey);
    let nextEnabled = getRecommendedSalesChannels(business.business_category);

    if (stored) {
      try {
        nextEnabled = normalizeSalesChannels(JSON.parse(stored));
      } catch {
        // Ignore malformed local preferences and fall back to the recommended set below.
      }
    }

    setEnabledSalesChannelIds(nextEnabled);
    const nextSelected =
      storedSelected && nextEnabled.includes(storedSelected)
        ? (storedSelected as SalesChannelId)
        : (nextEnabled[0] as SalesChannelId | undefined) ?? '';
    setSelectedSalesChannelId(nextSelected);
  }, [business?.business_category, business?.id, me?.business_id, salesChannelStorageKey, selectedSalesChannelStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || !business?.id) {
      return;
    }

    if (enabledSalesChannelIds.length === 0) {
      return;
    }

    window.localStorage.setItem(salesChannelStorageKey, JSON.stringify(enabledSalesChannelIds));
  }, [business?.id, enabledSalesChannelIds, salesChannelStorageKey]);

  useEffect(() => {
    if (!enabledSalesChannelIds.length) {
      return;
    }

    if (!selectedSalesChannelId || !enabledSalesChannelIds.includes(selectedSalesChannelId)) {
      setSelectedSalesChannelId(enabledSalesChannelIds[0]);
    }
  }, [enabledSalesChannelIds, selectedSalesChannelId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !business?.id) {
      return;
    }

    if (!selectedSalesChannelId) {
      return;
    }

    window.localStorage.setItem(selectedSalesChannelStorageKey, selectedSalesChannelId);
  }, [business?.id, selectedSalesChannelId, selectedSalesChannelStorageKey]);

  const selectedSalesChannelOption = useMemo(() => {
    const fallbackId = (enabledSalesChannelIds[0] ?? 'walk_in') as SalesChannelId;
    return getSalesChannelOption((selectedSalesChannelId || fallbackId) as SalesChannelId);
  }, [enabledSalesChannelIds, selectedSalesChannelId]);

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
          onChange={(event) => setSelectedSalesChannelId(event.target.value as SalesChannelId)}
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
