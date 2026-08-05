'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import pageStyles from '../page.module.css';
import styles from './sales.module.css';
import { useGetAccountsQuery } from '@/lib/features/accounts/accountsApi';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetCategoriesQuery, useGetProductsQuery } from '@/lib/features/products/productsApi';
import { useGetSalesQuery } from '@/lib/features/sales/salesApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { getPaymentTypeLabel } from '@/lib/business/paymentTypes';
import { Sale, SaleStatus } from '@/types/sale';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_TABS: { label: string; value: SaleStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Draft', value: 'draft' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' },
];

const DATE_PRESETS = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: 'last_7_days' },
  { label: 'Last 30 days', value: 'last_30_days' },
  { label: 'This month', value: 'this_month' },
  { label: 'Last month', value: 'last_month' },
];

type AggregateRow = {
  id: string;
  label: string;
  sublabel?: string;
  units: number;
  count: number;
  amount: number;
};

function getDateRange(preset: string): { start_date?: string; end_date?: string } {
  const now = new Date();
  if (preset === 'all') return {};

  let from = new Date();
  let to = new Date();

  switch (preset) {
    case 'today':
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;
    case 'last_7_days':
      from.setDate(now.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      break;
    case 'last_30_days':
      from.setDate(now.getDate() - 30);
      from.setHours(0, 0, 0, 0);
      break;
    case 'this_month':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 0);
      to.setHours(23, 59, 59, 999);
      break;
  }

  return {
    start_date: from.toISOString(),
    end_date: to.toISOString(),
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function formatAmount(amount: number) {
  return `K${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatDecimal(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatEmployeeName(firstName?: string, lastName?: string, fallback?: string) {
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  return fullName || fallback || 'Unknown user';
}

function parseQuantity(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 1;
}

function saleLabel(sale: Sale) {
  const label = sale.sale_number || sale.id;
  return label;
}

export default function SalesPage() {
  const [activeStatus, setActiveStatus] = useState<SaleStatus | ''>('');
  const [datePreset, setDatePreset] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const dateRange = useMemo(() => getDateRange(datePreset), [datePreset]);
  const offset = (page - 1) * pageSize;

  const reportQuery = useGetSalesQuery({
    status: activeStatus || undefined,
    limit: 100,
    offset: 0,
    ...dateRange,
  });
  const pageQuery = useGetSalesQuery({
    status: activeStatus || undefined,
    limit: pageSize,
    offset,
    ...dateRange,
  });
  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery({});
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: accounts = [], isLoading: isAccountsLoading } = useGetAccountsQuery();
  const { data: me } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });

  const sales = pageQuery.data?.data ?? [];
  const total = pageQuery.data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const reportSales = reportQuery.data?.data ?? [];

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const employeeMap = useMemo(
    () =>
      new Map(
        accounts.map((account) => [
          account.user_id,
          formatEmployeeName(account.first_name, account.last_name, account.email),
        ]),
      ),
    [accounts],
  );

  const summary = useMemo(() => {
    const completedSales = reportSales.filter((sale) => sale.status === 'completed');
    const refundedSales = reportSales.filter((sale) => sale.status === 'refunded');
    const revenue = reportSales.reduce((sum, sale) => sum + (sale.total_amount ?? 0), 0);
    const itemsSold = reportSales.reduce(
      (sum, sale) =>
        sum + sale.items.reduce((saleTotal, item) => saleTotal + parseQuantity(item.quantity), 0),
      0,
    );
    const averageTicket = completedSales.length > 0 ? revenue / completedSales.length : 0;

    return {
      totalSales: reportSales.length,
      revenue,
      itemsSold,
      averageTicket,
      completedSales: completedSales.length,
      refundedSales: refundedSales.length,
    };
  }, [reportSales]);

  const itemRows = useMemo(() => {
    const map = new Map<string, AggregateRow>();
    reportSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = productMap.get(item.product_id);
        const name = product?.name ?? `Product ${item.product_id.slice(0, 8)}`;
        const categoryName = product?.category_id ? categoryMap.get(product.category_id)?.name ?? 'Uncategorized' : 'Uncategorized';
        const existing = map.get(item.product_id) ?? {
          id: item.product_id,
          label: name,
          sublabel: categoryName,
          units: 0,
          count: 0,
          amount: 0,
        };
        existing.units += parseQuantity(item.quantity);
        existing.count += 1;
        existing.amount += item.line_total ?? 0;
        map.set(item.product_id, existing);
      });
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 6);
  }, [reportSales, productMap, categoryMap]);

  const categoryRows = useMemo(() => {
    const map = new Map<string, AggregateRow>();
    reportSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = productMap.get(item.product_id);
        const categoryId = product?.category_id ?? 'uncategorized';
        const category = product?.category_id ? categoryMap.get(product.category_id) : null;
        const label = category?.name ?? 'Uncategorized';
        const existing = map.get(categoryId) ?? {
          id: categoryId,
          label,
          units: 0,
          count: 0,
          amount: 0,
        };
        existing.units += parseQuantity(item.quantity);
        existing.count += 1;
        existing.amount += item.line_total ?? 0;
        map.set(categoryId, existing);
      });
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 6);
  }, [reportSales, productMap, categoryMap]);

  const employeeRows = useMemo(() => {
    const map = new Map<string, AggregateRow>();
    reportSales.forEach((sale) => {
      const employeeId = sale.created_by ?? 'unassigned';
      const label = sale.created_by ? employeeMap.get(sale.created_by) ?? `User ${sale.created_by.slice(0, 8)}` : 'Unassigned';
      const existing = map.get(employeeId) ?? {
        id: employeeId,
        label,
        units: 0,
        count: 0,
        amount: 0,
      };
      existing.count += 1;
      existing.amount += sale.total_amount ?? 0;
      existing.units += sale.items.reduce((sum, item) => sum + parseQuantity(item.quantity), 0);
      map.set(employeeId, existing);
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 6);
  }, [reportSales, employeeMap]);

  const paymentRows = useMemo(() => {
    const map = new Map<string, AggregateRow>();
    reportSales.forEach((sale) => {
      sale.payments.forEach((payment) => {
        const label = getPaymentTypeLabel(payment.method, business?.payment_types);
        const existing = map.get(payment.method) ?? {
          id: payment.method,
          label,
          units: 0,
          count: 0,
          amount: 0,
        };
        existing.count += 1;
        existing.amount += payment.amount ?? 0;
        map.set(payment.method, existing);
      });
    });
    return [...map.values()].sort((a, b) => b.amount - a.amount);
  }, [business?.payment_types, reportSales]);

  const receiptRows = useMemo(() => reportSales.slice(0, 8), [reportSales]);

  function handleStatusChange(status: SaleStatus | '') {
    setActiveStatus(status);
    setPage(1);
  }

  function handleDateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setDatePreset(e.target.value);
    setPage(1);
  }

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: (number | '...')[] = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i += 1) range.push(i);
    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  }, [page, totalPages]);

  const startEntry = total === 0 ? 0 : offset + 1;
  const endEntry = Math.min(offset + pageSize, total);
  const reportLoading = reportQuery.isLoading || isProductsLoading || isCategoriesLoading || isAccountsLoading;

  return (
    <div className={pageStyles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={pageStyles.title}>Sales</h1>
          <p className={pageStyles.subtitle}>Track sales, receipts, and performance by item, category, employee, and payment type.</p>
        </div>
      </div>

      <div className={`${pageStyles.card} ${styles.reportCard}`} style={{ gridColumn: '1 / -1' }}>
        <div className={styles.toolbar}>
          <div className={styles.tabsBar} role="tablist" aria-label="Filter by status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                role="tab"
                aria-selected={activeStatus === tab.value}
                className={`${styles.tab} ${activeStatus === tab.value ? styles.tabActive : ''}`}
                onClick={() => handleStatusChange(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.toolbarLeft}>
            <label htmlFor="date-preset" className={styles.toolbarLabel}>
              Period
            </label>
            <select id="date-preset" className={styles.dateSelect} value={datePreset} onChange={handleDateChange}>
              {DATE_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!reportLoading && !pageQuery.error && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Sales</span>
              <strong className={styles.statValue}>{summary.totalSales.toLocaleString()}</strong>
              <span className={styles.statMeta}>Filtered records loaded for reporting</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Revenue</span>
              <strong className={styles.statValue}>{formatAmount(summary.revenue)}</strong>
              <span className={styles.statMeta}>Completed and draft sales in the current filter</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Items sold</span>
              <strong className={styles.statValue}>{formatDecimal(summary.itemsSold)}</strong>
              <span className={styles.statMeta}>Across all loaded item lines</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Average ticket</span>
              <strong className={styles.statValue}>{formatAmount(summary.averageTicket)}</strong>
              <span className={styles.statMeta}>{summary.refundedSales} refunded sales in view</span>
            </div>
          </div>
        )}

        {pageQuery.error && (
          <div className={styles.errorState}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Failed to load sales. Please try again later.
          </div>
        )}

        <div className={styles.reportGrid}>
          <div className={styles.leftColumn}>
            <section className={pageStyles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitleText}>Sales by Item</h2>
                  <p className={styles.sectionHint}>Top items from the latest 100 sales in the selected filter.</p>
                </div>
              </div>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Units</th>
                      <th>Sales</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <tr key={index} className={styles.skeletonRow}>
                          <td><div className={styles.skeleton} style={{ width: '140px' }} /></td>
                          <td><div className={styles.skeleton} style={{ width: '60px' }} /></td>
                          <td><div className={styles.skeleton} style={{ width: '60px' }} /></td>
                          <td><div className={styles.skeleton} style={{ width: '90px' }} /></td>
                        </tr>
                      ))
                    ) : itemRows.length > 0 ? (
                      itemRows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <div className={styles.cellStack}>
                              <strong>{row.label}</strong>
                              <span>{row.sublabel ?? 'Uncategorized'}</span>
                            </div>
                          </td>
                          <td>{formatDecimal(row.units)}</td>
                          <td>{row.count}</td>
                          <td className={styles.amount}>{formatAmount(row.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <div className={styles.emptyState}>
                            <p>No item breakdown available yet.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={pageStyles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitleText}>Sales by Category</h2>
                  <p className={styles.sectionHint}>Aggregated from the products attached to the loaded sales.</p>
                </div>
              </div>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Units</th>
                      <th>Sales</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <tr key={index} className={styles.skeletonRow}>
                          <td><div className={styles.skeleton} style={{ width: '120px' }} /></td>
                          <td><div className={styles.skeleton} style={{ width: '60px' }} /></td>
                          <td><div className={styles.skeleton} style={{ width: '60px' }} /></td>
                          <td><div className={styles.skeleton} style={{ width: '90px' }} /></td>
                        </tr>
                      ))
                    ) : categoryRows.length > 0 ? (
                      categoryRows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <div className={styles.cellStack}>
                              <strong>{row.label}</strong>
                              <span>{row.count} line items</span>
                            </div>
                          </td>
                          <td>{formatDecimal(row.units)}</td>
                          <td>{row.count}</td>
                          <td className={styles.amount}>{formatAmount(row.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <div className={styles.emptyState}>
                            <p>No category breakdown available yet.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={pageStyles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitleText}>Receipts</h2>
                  <p className={styles.sectionHint}>Download receipt files for the most recent sales in view.</p>
                </div>
              </div>
              <div className={styles.receiptList}>
                {reportLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className={styles.receiptSkeleton}>
                      <div className={styles.skeleton} style={{ width: '180px' }} />
                      <div className={styles.skeleton} style={{ width: '110px' }} />
                    </div>
                  ))
                ) : receiptRows.length > 0 ? (
                  receiptRows.map((sale) => {
                    const employee = sale.created_by ? employeeMap.get(sale.created_by) ?? sale.created_by : 'Unknown user';
                    return (
                      <div key={sale.id} className={styles.receiptRow}>
                        <div className={styles.cellStack}>
                          <strong>{saleLabel(sale)}</strong>
                          <span>
                            {formatDate(sale.created_at)} · {employee}
                          </span>
                        </div>
                        <Link
                          className={styles.receiptButton}
                          href={`/dashboard/sales/${sale.id}/receipt`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open receipt
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyState}>
                    <p>No receipts available for download.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className={styles.rightColumn}>
            <section className={pageStyles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitleText}>Sales by Employee</h2>
                  <p className={styles.sectionHint}>Attribution uses the recorded creator for each sale.</p>
                </div>
              </div>
              <div className={styles.metricList}>
                {reportLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className={styles.metricRow}>
                      <div className={styles.skeleton} style={{ width: '140px', height: '12px' }} />
                      <div className={styles.skeleton} style={{ width: '90px', height: '12px' }} />
                    </div>
                  ))
                ) : employeeRows.length > 0 ? (
                  employeeRows.map((row) => (
                    <div key={row.id} className={styles.metricRow}>
                      <div className={styles.cellStack}>
                        <strong>{row.label}</strong>
                        <span>{row.count} sales</span>
                      </div>
                      <div className={styles.metricAmount}>{formatAmount(row.amount)}</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No employee breakdown available yet.</p>
                  </div>
                )}
              </div>
            </section>

            <section className={pageStyles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitleText}>Sales by Payment Type</h2>
                  <p className={styles.sectionHint}>Payments collected across the current sales window.</p>
                </div>
              </div>
              <div className={styles.metricList}>
                {reportLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className={styles.metricRow}>
                      <div className={styles.skeleton} style={{ width: '140px', height: '12px' }} />
                      <div className={styles.skeleton} style={{ width: '90px', height: '12px' }} />
                    </div>
                  ))
                ) : paymentRows.length > 0 ? (
                  paymentRows.map((row) => (
                    <div key={row.id} className={styles.metricRow}>
                      <div className={styles.cellStack}>
                        <strong>{row.label.replace(/_/g, ' ')}</strong>
                        <span>{row.count} payments</span>
                      </div>
                      <div className={styles.metricAmount}>{formatAmount(row.amount)}</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No payment breakdown available yet.</p>
                  </div>
                )}
              </div>
            </section>

            <section className={pageStyles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitleText}>Shifts</h2>
                  <p className={styles.sectionHint}>Daily shift snapshot based on the sales loaded on this screen.</p>
                </div>
              </div>
              <div className={styles.shiftGrid}>
                <div className={styles.shiftTile}>
                  <span>Completed sales</span>
                  <strong>{summary.completedSales.toLocaleString()}</strong>
                </div>
                <div className={styles.shiftTile}>
                  <span>Total revenue</span>
                  <strong>{formatAmount(summary.revenue)}</strong>
                </div>
                <div className={styles.shiftTile}>
                  <span>Refunds</span>
                  <strong>{summary.refundedSales.toLocaleString()}</strong>
                </div>
              </div>
              <div className={styles.shiftNote}>
                No dedicated shift endpoint is live yet, so this panel acts as a working shift snapshot for the selected period.
              </div>
            </section>
          </div>
        </div>

        <div className={styles.tableShell}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitleText}>Sales List</h2>
              <p className={styles.sectionHint}>Paginated operational view for drilling into individual transactions.</p>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table} aria-busy={pageQuery.isFetching}>
              <thead>
                <tr>
                  <th>Sale #</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pageQuery.isLoading
                  ? Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, index) => (
                      <tr key={index} className={styles.skeletonRow}>
                        <td><div className={styles.skeleton} style={{ width: '80px' }} /></td>
                        <td><div className={styles.skeleton} style={{ width: '140px' }} /></td>
                        <td><div className={styles.skeleton} style={{ width: '80px', borderRadius: '999px' }} /></td>
                        <td><div className={styles.skeleton} style={{ width: '50px' }} /></td>
                        <td><div className={styles.skeleton} style={{ width: '90px' }} /></td>
                      </tr>
                    ))
                  : sales.map((sale) => {
                      const statusClass = styles[sale.status as keyof typeof styles] ?? styles.draft;
                      return (
                        <tr key={sale.id} style={{ opacity: pageQuery.isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                          <td style={{ fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                            {sale.sale_number}
                          </td>
                          <td>{formatDate(sale.created_at)}</td>
                          <td>
                            <span className={`${styles.badge} ${statusClass}`}>
                              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                            </span>
                          </td>
                          <td>{sale.items?.length ?? 0}</td>
                          <td className={styles.amount}>{formatAmount(sale.total_amount ?? 0)}</td>
                        </tr>
                      );
                    })}

                {!pageQuery.isLoading && !pageQuery.error && sales.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className={styles.emptyState}>
                        <p>No sales found</p>
                        <small>Try adjusting your filters or date range.</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!pageQuery.isLoading && !pageQuery.error && total > 0 && (
            <div className={styles.pagination}>
              <div className={styles.paginationSummary}>
                <span className={styles.paginationInfo}>
                  Showing {startEntry}–{endEntry} of {total.toLocaleString()} sales
                </span>
                <select aria-label="Rows per page" className={styles.pageSizeSelect} value={pageSize} onChange={handlePageSizeChange}>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.paginationControls}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1 || pageQuery.isFetching}
                  aria-label="Previous page"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {pageNumbers.map((n, index) =>
                  n === '...' ? (
                    <span key={`ellipsis-${index}`} className={styles.pageEllipsis}>
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      className={`${styles.pageBtn} ${page === n ? styles.pageBtnActive : ''}`}
                      onClick={() => setPage(n as number)}
                      disabled={pageQuery.isFetching}
                      aria-label={`Page ${n}`}
                      aria-current={page === n ? 'page' : undefined}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages || pageQuery.isFetching}
                  aria-label="Next page"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
