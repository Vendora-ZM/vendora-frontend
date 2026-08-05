'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/lib/store';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart } from '@/components/pos/Cart';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import styles from './page.module.css';

type FlowStage = 'selection' | 'checkout';

export default function PosPage() {
  const [stage, setStage] = useState<FlowStage>('selection');
  const { cart } = useAppSelector((s) => s.pos);
  const { data: me } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const paymentTypes = business?.payment_types?.length ? business.payment_types : undefined;

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
            onBackToSelection={() => setStage('selection')}
            onStartNewSale={() => setStage('selection')}
          />
        </section>
      )}
    </div>
  );
}
