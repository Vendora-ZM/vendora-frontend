import React from 'react';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { Cart } from '@/components/pos/Cart';
import { PaymentModal } from '@/components/pos/PaymentModal';
import styles from './page.module.css';

export default function PosPage() {
  return (
    <div className={styles.posLayout}>
      <div className={styles.leftPane}>
        <ProductGrid />
      </div>
      <div className={styles.rightPane}>
        <Cart />
      </div>
      
      <PaymentModal />
    </div>
  );
}
