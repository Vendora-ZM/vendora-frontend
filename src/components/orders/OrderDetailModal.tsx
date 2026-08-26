'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { closeDetailModal } from '@/lib/features/sales/salesSlice';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { Modal } from '@/components/ui/Modal';
import { formatCurrencyFromCents } from '@/lib/utils/currency';
import styles from './OrderDetailModal.module.css';

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash', card: 'Card', mobile_money: 'Mobile Money',
  bank_transfer: 'Bank Transfer', other: 'Other',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Completed', cls: 'completed' },
  draft:     { label: 'Draft',     cls: 'draft' },
  refunded:  { label: 'Refunded',  cls: 'refunded' },
  cancelled: { label: 'Cancelled', cls: 'cancelled' },
};

export const OrderDetailModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDetailModalOpen, selectedSale } = useAppSelector((s) => s.sales);
  const { data: me } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const currencyCode = business?.currency_code;

  if (!selectedSale) return null;

  const status = STATUS_CONFIG[selectedSale.status] ?? { label: selectedSale.status, cls: 'draft' };

  return (
    <Modal
      isOpen={isDetailModalOpen}
      onClose={() => dispatch(closeDetailModal())}
      title={`Order ${selectedSale.sale_number}`}
      size="lg"
    >
      <div className={styles.content}>
        {/* Header row */}
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Date</span>
            <span className={styles.metaValue}>{formatDate(selectedSale.created_at)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Status</span>
            <span className={`${styles.statusBadge} ${styles[status.cls]}`}>{status.label}</span>
          </div>
          {selectedSale.completed_at && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Completed</span>
              <span className={styles.metaValue}>{formatDate(selectedSale.completed_at)}</span>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Items</h3>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Tax</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedSale.items.map((item) => (
                <tr key={item.id}>
                  <td className={styles.productIdCell}>Unknown product</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrencyFromCents(item.unit_price, { currencyCode })}</td>
                  <td>{formatCurrencyFromCents(item.discount_amount, { currencyCode })}</td>
                  <td>{formatCurrencyFromCents(item.tax_amount, { currencyCode })}</td>
                  <td><strong>{formatCurrencyFromCents(item.line_total, { currencyCode })}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className={styles.totalsSection}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{formatCurrencyFromCents(selectedSale.subtotal, { currencyCode })}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Tax</span>
            <span>{formatCurrencyFromCents(selectedSale.tax_amount, { currencyCode })}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Discount</span>
            <span>-{formatCurrencyFromCents(selectedSale.discount_amount, { currencyCode })}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.grandTotal}`}>
            <span>Total</span>
            <span>{formatCurrencyFromCents(selectedSale.total_amount, { currencyCode })}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Amount Paid</span>
            <span>{formatCurrencyFromCents(selectedSale.amount_paid, { currencyCode })}</span>
          </div>
        </div>

        {/* Payments */}
        {selectedSale.payments.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Payments</h3>
            <div className={styles.paymentList}>
              {selectedSale.payments.map((p) => (
                <div key={p.id} className={styles.paymentItem}>
                  <span className={styles.paymentMethod}>{PAYMENT_LABELS[p.method] ?? p.method}</span>
                  <span className={styles.paymentAmount}>{formatCurrencyFromCents(p.amount, { currencyCode })}</span>
                  {p.reference && <span className={styles.paymentRef}>Ref: {p.reference}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {selectedSale.notes && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notes</h3>
            <p className={styles.notes}>{selectedSale.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
