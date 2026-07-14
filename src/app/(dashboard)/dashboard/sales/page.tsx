'use client';

import React, { useState, useMemo } from 'react';
import pageStyles from '../page.module.css';
import styles from './sales.module.css';
import { useGetSalesQuery } from '@/lib/features/sales/salesApi';
import { SaleStatus } from '@/types/sale';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_TABS: { label: string; value: SaleStatus | '' }[] = [
  { label: 'All',       value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Draft',     value: 'draft' },
  { label: 'Refunded',  value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' },
];

const DATE_PRESETS = [
  { label: 'All time',     value: 'all' },
  { label: 'Today',        value: 'today' },
  { label: 'Last 7 days',  value: 'last_7_days' },
  { label: 'Last 30 days', value: 'last_30_days' },
  { label: 'This month',   value: 'this_month' },
  { label: 'Last month',   value: 'last_month' },
];

function getDateRange(preset: string): { start_date?: string; end_date?: string } {
  const now = new Date();
  if (preset === 'all') return {};

  let from = new Date();
  let to   = new Date();

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
      to   = new Date(now.getFullYear(), now.getMonth(), 0);
      to.setHours(23, 59, 59, 999);
      break;
  }

  return {
    start_date: from.toISOString(),
    end_date:   to.toISOString(),
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatAmount(amount: number) {
  return `K${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesPage() {
  const [activeStatus, setActiveStatus] = useState<SaleStatus | ''>('');
  const [datePreset, setDatePreset]     = useState('all');
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(25);

  const dateRange = useMemo(() => getDateRange(datePreset), [datePreset]);

  const offset = (page - 1) * pageSize;

  const { data, isLoading, isFetching, error } = useGetSalesQuery({
    status:     activeStatus || undefined,
    limit:      pageSize,
    offset,
    ...dateRange,
  });

  const sales      = data?.data ?? [];
  const total      = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset to page 1 when filters change
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

  // Compute visible page numbers (window of 5)
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: (number | '...')[] = [];
    const left  = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  }, [page, totalPages]);

  const startEntry = total === 0 ? 0 : offset + 1;
  const endEntry   = Math.min(offset + pageSize, total);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={pageStyles.container}>
      {/* Header */}
      <div>
        <h1 className={pageStyles.title}>Sales</h1>
        <p className={pageStyles.subtitle}>Track and manage all your sales transactions.</p>
      </div>

      {/* Card */}
      <div className={pageStyles.card} style={{ gridColumn: '1 / -1' }}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          {/* Status Tabs */}
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

          {/* Date Filter */}
          <div className={styles.toolbarLeft}>
            <label htmlFor="date-preset" style={{ fontSize: '0.875rem', color: 'var(--color-grey)', fontWeight: 500 }}>
              Period:
            </label>
            <select
              id="date-preset"
              className={styles.dateSelect}
              value={datePreset}
              onChange={handleDateChange}
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Row */}
        {!isLoading && !error && (
          <div className={styles.summaryRow}>
            <div className={styles.summaryChip}>
              Total Sales <span>{total.toLocaleString()}</span>
            </div>
            {total > 0 && (
              <>
                <div className={styles.summaryChip}>
                  Revenue{' '}
                  <span>
                    {formatAmount(sales.reduce((sum, s) => sum + (s.total_amount ?? 0), 0))}
                  </span>
                </div>
                <div className={styles.summaryChip}>
                  Items sold{' '}
                  <span>
                    {sales.reduce((sum, s) => sum + (s.items?.length ?? 0), 0)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={styles.errorState}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Failed to load sales. Please try again later.
          </div>
        )}

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table} aria-busy={isFetching}>
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
              {isLoading
                ? Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, i) => (
                    <tr key={i} className={styles.skeletonRow}>
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
                      <tr key={sale.id} style={{ opacity: isFetching ? 0.5 : 1, transition: 'opacity 0.2s' }}>
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
                  })
              }

              {!isLoading && !error && sales.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                        <rect x="9" y="3" width="6" height="4" rx="2"/>
                      </svg>
                      <p>No sales found</p>
                      <small>Try adjusting your filters or date range.</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !error && total > 0 && (
          <div className={styles.pagination}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={styles.paginationInfo}>
                Showing {startEntry}–{endEntry} of {total.toLocaleString()} sales
              </span>
              <select
                aria-label="Rows per page"
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
            </div>

            <div className={styles.paginationControls}>
              {/* Prev */}
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                aria-label="Previous page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>

              {pageNumbers.map((n, i) =>
                n === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--color-grey)' }}>…</span>
                ) : (
                  <button
                    key={n}
                    className={`${styles.pageBtn} ${page === n ? styles.pageBtnActive : ''}`}
                    onClick={() => setPage(n as number)}
                    disabled={isFetching}
                    aria-label={`Page ${n}`}
                    aria-current={page === n ? 'page' : undefined}
                  >
                    {n}
                  </button>
                )
              )}

              {/* Next */}
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
                aria-label="Next page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
