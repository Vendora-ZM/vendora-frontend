'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/lib/store';
import { useGetSalesQuery } from '@/lib/features/sales/salesApi';
import { OrdersToolbar } from '@/components/orders/OrdersToolbar';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { OrderDetailModal } from '@/components/orders/OrderDetailModal';
import { SaleStatus } from '@/types/sale';
import styles from './page.module.css';

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const { statusFilter } = useAppSelector((s) => s.sales);
  const [pageByFilter, setPageByFilter] = useState<Record<string, number>>({});

  const { data: salesResponse, isLoading, isError } = useGetSalesQuery(
    statusFilter ? { status: statusFilter as SaleStatus } : {}
  );
  const orders = salesResponse?.data ?? [];
  const filterKey = statusFilter || '__all__';
  const currentPage = pageByFilter[filterKey] ?? 1;
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedOrders = orders.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);
  const startItem = orders.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safeCurrentPage * PAGE_SIZE, orders.length);

  const handlePageChange = (next: number | ((page: number) => number)) => {
    setPageByFilter((current) => {
      const basePage = current[filterKey] ?? 1;
      const resolved = typeof next === 'function' ? next(basePage) : next;
      return {
        ...current,
        [filterKey]: resolved,
      };
    });
  };

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
        <OrdersTable
          orders={pagedOrders}
          isLoading={isLoading}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalOrders={orders.length}
          startItem={startItem}
          endItem={endItem}
          onPageChange={handlePageChange}
        />
      )}

      <OrderDetailModal />
    </div>
  );
}
