'use client';

import React from 'react';
import { Sale } from '@/types/sale';
import { useAppDispatch } from '@/lib/store';
import { openDetailModal } from '@/lib/features/sales/salesSlice';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { formatCurrencyFromCents } from '@/lib/utils/currency';
import { Button } from '@/components/ui/Button';
import styles from './OrdersTable.module.css';

interface OrdersTableProps {
  orders: Sale[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  startItem: number;
  endItem: number;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Completed', cls: 'completed' },
  draft: { label: 'Draft', cls: 'draft' },
  refunded: { label: 'Refunded', cls: 'refunded' },
  cancelled: { label: 'Cancelled', cls: 'cancelled' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className={i === 1 ? styles.hideOnMobile : ''}><div className={styles.skeleton} /></td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={6}>
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1" ry="1"></rect><line x1="9" y1="12" x2="15" y2="12"></line><line x1="9" y1="16" x2="13" y2="16"></line></svg>
          <h3 className={styles.emptyTitle}>No orders found</h3>
          <p className={styles.emptySubtitle}>Orders will appear here once sales are recorded.</p>
        </div>
      </td>
    </tr>
  );
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  currentPage,
  totalPages,
  totalOrders,
  startItem,
  endItem,
  onPageChange,
}) => {
  const dispatch = useAppDispatch();
  const { data: me } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const currencyCode = business?.currency_code;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order No.</th>
            <th className={styles.hideOnMobile}>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            : orders.length === 0
            ? <EmptyState />
            : orders.map((order) => {
                const status = STATUS_CONFIG[order.status] ?? { label: order.status, cls: 'draft' };
                return (
                  <tr key={order.id} className={styles.row}>
                    <td>
                      <span className={styles.orderNumber}>{order.sale_number}</span>
                    </td>
                    <td className={`${styles.dateCell} ${styles.hideOnMobile}`}>{formatDate(order.created_at)}</td>
                    <td className={styles.itemsCell}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                    <td>
                      <span className={styles.totalAmount}>{formatCurrencyFromCents(order.total_amount, { currencyCode })}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[status.cls]}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.viewBtn}
                        onClick={() => dispatch(openDetailModal(order))}
                        title="View order details"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>

      {!isLoading && totalOrders > 0 ? (
        <div className={styles.pagination}>
          <div className={styles.paginationSummary}>
            Showing {startItem} to {endItem} of {totalOrders}
          </div>
          <div className={styles.paginationControls}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className={styles.pageNumbers} aria-label="Order pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`${styles.pageNumber} ${page === currentPage ? styles.pageNumberActive : ''}`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
