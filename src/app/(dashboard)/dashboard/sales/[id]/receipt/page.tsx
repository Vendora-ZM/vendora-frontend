'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetAccountsQuery } from '@/lib/features/accounts/accountsApi';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { useGetProductsQuery } from '@/lib/features/products/productsApi';
import { useGetSaleByIdQuery } from '@/lib/features/sales/salesApi';
import { SalePayment, SaleStatus } from '@/types/sale';
import styles from './page.module.css';

function formatAmount(amount: number) {
  return `K${(amount / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(iso: string) {
  const value = new Date(iso);
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + `, ${value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function parseQuantity(quantity: string) {
  const value = Number.parseFloat(quantity);
  return Number.isFinite(value) ? value : 1;
}

function formatPaymentMethod(method: SalePayment['method']) {
  return method.replace(/_/g, ' ');
}

function formatEmployeeName(firstName?: string, lastName?: string, fallback?: string) {
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  return fullName || fallback || 'Unknown user';
}

const STATUS_LABELS: Record<SaleStatus, string> = {
  draft: 'Draft',
  completed: 'Completed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

export default function SaleReceiptPage() {
  const params = useParams<{ id?: string | string[] }>();
  const saleId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data: me } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const { data: locations = [] } = useGetLocationsQuery();
  const { data: sale, isLoading, error } = useGetSaleByIdQuery(saleId, {
    skip: !saleId,
  });
  const { data: products = [] } = useGetProductsQuery({});
  const { data: accounts = [] } = useGetAccountsQuery();

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const location = useMemo(
    () => locations.find((entry) => entry.id === sale?.location_id) ?? null,
    [locations, sale?.location_id],
  );
  const employee = useMemo(() => {
    if (!sale?.created_by) return null;
    return accounts.find((account) => account.user_id === sale.created_by) ?? null;
  }, [accounts, sale?.created_by]);

  const receiptDate = sale?.completed_at ?? sale?.created_at ?? '';
  const cashierName = employee
    ? formatEmployeeName(employee.first_name, employee.last_name, employee.email)
    : sale?.created_by ?? 'Unknown user';

  useEffect(() => {
    if (sale) {
      document.title = `${sale.sale_number} receipt`;
    }
  }, [sale]);

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <p className={styles.kicker}>Receipt preview</p>
          <h1 className={styles.title}>Printable sale receipt</h1>
          <p className={styles.subtitle}>Open the print dialog to save this receipt as PDF or send it to a printer.</p>
        </div>

        <div className={styles.actions}>
          <Link href="/dashboard/sales" className={styles.secondaryButton}>
            Back to sales
          </Link>
          <button type="button" className={styles.primaryButton} onClick={() => window.print()}>
            Print receipt
          </button>
        </div>
      </div>

      {error ? (
        <div className={styles.errorState}>We could not load this receipt right now.</div>
      ) : (
        <main className={styles.receiptShell}>
          <section className={styles.receiptCard}>
            <div className={styles.receiptHeader}>
              <div>
                <span className={styles.brand}>{business?.name ?? 'Vendora'}</span>
                <h2>{sale?.sale_number ?? (isLoading ? 'Loading receipt…' : 'Receipt')}</h2>
                <p>
                  {location?.name ?? sale?.location_id ?? 'Unknown location'} · {receiptDate ? formatDateTime(receiptDate) : '—'}
                </p>
              </div>

              <div className={styles.statusBlock}>
                <span className={`${styles.statusPill} ${styles[sale?.status ?? 'draft'] ?? ''}`}>
                  {sale ? STATUS_LABELS[sale.status] : 'Loading'}
                </span>
                <strong>{formatAmount(sale?.total_amount ?? 0)}</strong>
                <small>Cashier: {cashierName}</small>
              </div>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryTile}>
                <span>Subtotal</span>
                <strong>{formatAmount(sale?.subtotal ?? 0)}</strong>
              </div>
              <div className={styles.summaryTile}>
                <span>Tax</span>
                <strong>{formatAmount(sale?.tax_amount ?? 0)}</strong>
              </div>
              <div className={styles.summaryTile}>
                <span>Discount</span>
                <strong>{formatAmount(sale?.discount_amount ?? 0)}</strong>
              </div>
              <div className={styles.summaryTile}>
                <span>Total</span>
                <strong>{formatAmount(sale?.total_amount ?? 0)}</strong>
              </div>
            </div>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Items</h3>
                <span>{sale?.items.length ?? 0} line items</span>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className={styles.emptyCell}>
                          Loading receipt data…
                        </td>
                      </tr>
                    ) : sale?.items.length ? (
                      sale.items.map((item) => {
                        const product = productMap.get(item.product_id);
                        return (
                          <tr key={item.id}>
                            <td>
                              <div className={styles.itemCell}>
                                <strong>{product?.name ?? item.product_id}</strong>
                                <span>{product?.sku ?? 'No SKU available'}</span>
                              </div>
                            </td>
                            <td>{parseQuantity(item.quantity)}</td>
                            <td>{formatAmount(item.unit_price)}</td>
                            <td>{formatAmount(item.line_total)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className={styles.emptyCell}>
                          No items on this receipt.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Payments</h3>
                <span>{sale?.payments.length ?? 0} payment entries</span>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Reference</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={3} className={styles.emptyCell}>
                          Loading payment data…
                        </td>
                      </tr>
                    ) : sale?.payments.length ? (
                      sale.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{formatPaymentMethod(payment.method)}</td>
                          <td>{payment.reference ?? '—'}</td>
                          <td>{formatAmount(payment.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className={styles.emptyCell}>
                          No payments recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <div className={styles.footerNote}>
              {sale?.notes ? <p>{sale.notes}</p> : <p>No notes were attached to this sale.</p>}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
