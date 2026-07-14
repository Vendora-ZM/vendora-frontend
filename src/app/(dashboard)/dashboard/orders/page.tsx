'use client';

import React from 'react';
import { useAppSelector } from '@/lib/store';
import { useGetSalesQuery } from '@/lib/features/sales/salesApi';
import { OrdersToolbar } from '@/components/orders/OrdersToolbar';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { OrderDetailModal } from '@/components/orders/OrderDetailModal';
import { SaleStatus } from '@/types/sale';
import styles from './page.module.css';

export default function OrdersPage() {
  const { statusFilter } = useAppSelector((s) => s.sales);

  const { data: salesResponse, isLoading, isError } = useGetSalesQuery(
    statusFilter ? { status: statusFilter as SaleStatus } : {}
  );
  const orders = salesResponse?.data ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>
            {isLoading ? 'Loading…' : `${salesResponse?.meta?.total ?? 0} order${(salesResponse?.meta?.total ?? 0) !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <OrdersToolbar />

      {isError ? (
        <div className={styles.errorState}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>Failed to load orders. Please check your connection and try again.</p>
        </div>
      ) : (
        <OrdersTable orders={orders} isLoading={isLoading} />
      )}

      <OrderDetailModal />
    </div>
  );
}
