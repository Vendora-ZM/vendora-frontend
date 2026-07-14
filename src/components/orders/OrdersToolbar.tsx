'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { setStatusFilter } from '@/lib/features/sales/salesSlice';
import { SaleStatus } from '@/types/sale';
import styles from './OrdersToolbar.module.css';

const STATUS_OPTIONS: { label: string; value: SaleStatus | '' }[] = [
  { label: 'All Orders', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Draft', value: 'draft' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const OrdersToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { statusFilter } = useAppSelector((s) => s.sales);

  return (
    <div className={styles.toolbar}>
      <div className={styles.statusTabs}>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.tab} ${statusFilter === opt.value ? styles.active : ''}`}
            onClick={() => dispatch(setStatusFilter(opt.value))}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
