'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { setDateRangePreset, setLocationId, DateRangePreset } from '@/lib/features/analytics/analyticsSlice';
import { useGetSalesTrendsQuery, useGetTopProductsQuery } from '@/lib/features/analytics/analyticsApi';
import { useGetSalesQuery } from '@/lib/features/sales/salesApi';
import { useGetBalancesQuery } from '@/lib/features/inventory/inventoryApi';
import { useGetProductsQuery } from '@/lib/features/products/productsApi';
import { useGetCustomersQuery } from '@/lib/features/customers/customersApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { logout } from '@/lib/features/auth/authSlice';
import { getDateRange } from '@/lib/utils/dateRange';
import { Product } from '@/types/product';
import { Sale, SaleStatus } from '@/types/sale';
import styles from './page.module.css';

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
];

const STATUS_LABELS: Record<SaleStatus, string> = {
  draft: 'Draft',
  completed: 'Completed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

function formatCurrency(amount: number) {
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
  }) + ' ' + value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getCustomerName(customer: { first_name: string; last_name: string } | undefined) {
  if (!customer) return 'Walk-in customer';
  return `${customer.first_name} ${customer.last_name}`.trim();
}

function isUnauthorizedError(error: unknown) {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'status' in error &&
    (error as { status?: number | string }).status === 401
  );
}

export default function DashboardOverview() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { dateRangePreset, locationId } = useAppSelector((s) => s.analytics);
  const { from, to } = useMemo(() => getDateRange(dateRangePreset), [dateRangePreset]);

  const { data: locationsRaw = [] } = useGetLocationsQuery();
  const { data: salesTrends = [], isLoading: trendsLoading, error: trendsError } = useGetSalesTrendsQuery({
    from,
    to,
    location_id: locationId,
  });
  const { data: topProducts = [], isLoading: topProductsLoading, error: topProductsError } = useGetTopProductsQuery({
    from,
    to,
    location_id: locationId,
    limit: 5,
  });
  const { data: salesResponse, isLoading: salesLoading, error: salesError } = useGetSalesQuery({
    start_date: from,
    end_date: to,
    location_id: locationId,
    limit: 10,
    offset: 0,
  });
  const { data: balances = [], isLoading: balancesLoading, error: balancesError } = useGetBalancesQuery({
    location_id: locationId,
  });
  const { data: productsRaw = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery({});
  const { data: customersRaw = [], isLoading: customersLoading, error: customersError } = useGetCustomersQuery({});

  const productsMap = useMemo(
    () => Object.fromEntries(productsRaw.map((product: Product) => [product.id, product])),
    [productsRaw]
  );

  const customersMap = useMemo(
    () =>
      Object.fromEntries(
        customersRaw.map((customer) => [customer.id, customer])
      ),
    [customersRaw]
  );

  const selectedLocation = locationsRaw.find((location) => location.id === locationId);
  const selectedPeriod = DATE_PRESETS.find((preset) => preset.value === dateRangePreset)?.label ?? 'Selected period';

  const totalRevenue = salesTrends.reduce((sum, row) => sum + row.revenue, 0);
  const totalCost = salesTrends.reduce((sum, row) => sum + row.cost, 0);
  const totalRefunds = salesTrends.reduce((sum, row) => sum + row.refund_amount, 0);
  const totalProfit = totalRevenue - totalCost - totalRefunds;
  const totalSalesCount = salesTrends.reduce((sum, row) => sum + row.sale_count, 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const inventoryValue = useMemo(
    () =>
      balances.reduce((sum, balance) => {
        const product = productsMap[balance.product_id];
        const quantityOnHand = Number(balance.quantity_on_hand || 0);
        const costPrice = product?.cost_price ?? 0;
        return sum + quantityOnHand * costPrice;
      }, 0),
    [balances, productsMap]
  );

  const recentSales = useMemo(() => {
    const rows = salesResponse?.data ?? [];
    return [...rows]
      .sort((a: Sale, b: Sale) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [salesResponse]);

  const lowStockAlerts = useMemo(() => {
    return balances
      .map((balance) => {
        const product = productsMap[balance.product_id];
        const available = Number(balance.quantity_available || 0);

        return product
          ? {
              product,
              available,
            }
          : null;
      })
      .filter((item): item is { product: Product; available: number } => item !== null)
      .filter((item) => item.available <= 5)
      .sort((a, b) => a.available - b.available)
      .slice(0, 3);
  }, [balances, productsMap]);

  const graphData = useMemo(() => {
    return [...salesTrends]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)
      .map((point) => ({
        label: new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: point.revenue / 100,
        revenue: point.revenue,
      }));
  }, [salesTrends]);

  const graphMax = Math.max(...graphData.map((point) => point.value), 1);
  const hasError = Boolean(
    trendsError || topProductsError || salesError || balancesError || productsError || customersError
  );
  const isLoading =
    trendsLoading ||
    topProductsLoading ||
    salesLoading ||
    balancesLoading ||
    productsLoading ||
    customersLoading;

  useEffect(() => {
    const unauthorized =
      isUnauthorizedError(trendsError) ||
      isUnauthorizedError(topProductsError) ||
      isUnauthorizedError(salesError) ||
      isUnauthorizedError(balancesError) ||
      isUnauthorizedError(productsError) ||
      isUnauthorizedError(customersError);

    if (unauthorized) {
      dispatch(logout());
      router.replace('/login');
    }
  }, [
    dispatch,
    router,
    trendsError,
    topProductsError,
    salesError,
    balancesError,
    productsError,
    customersError,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Live overview for {selectedPeriod.toLowerCase()}
            {selectedLocation ? ` at ${selectedLocation.name}` : ' across all locations'}.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.presetGroup} aria-label="Dashboard date range">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`${styles.presetBtn} ${dateRangePreset === preset.value ? styles.presetBtnActive : ''}`}
                onClick={() => dispatch(setDateRangePreset(preset.value))}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <label className={styles.locationField} htmlFor="dashboard-location">
            <span>Location</span>
            <select
              id="dashboard-location"
              className={styles.locationSelect}
              value={locationId ?? ''}
              onChange={(e) => dispatch(setLocationId(e.target.value || undefined))}
            >
              <option value="">All locations</option>
              {locationsRaw.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {hasError && (
        <div className={styles.errorBanner}>
          Some dashboard data could not be loaded. The rest of the dashboard is still live.
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Revenue</h3>
            <div className={`${styles.statIcon} ${styles.iconSales}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>
          <p className={styles.statValue}>{isLoading ? 'Loading…' : formatCurrency(totalRevenue)}</p>
          <span className={`${styles.statTrend} ${styles.positive}`}>
            {totalSalesCount.toLocaleString()} sales in the selected period
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Profit</h3>
            <div className={`${styles.statIcon} ${styles.iconProfit}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="12" y1="2" x2="12" y2="6" />
              </svg>
            </div>
          </div>
          <p className={styles.statValue}>{isLoading ? 'Loading…' : formatCurrency(totalProfit)}</p>
          <span className={`${styles.statTrend} ${styles.positive}`}>Margin {profitMargin.toFixed(1)}%</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Inventory Value</h3>
            <div className={`${styles.statIcon} ${styles.iconInventory}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          </div>
          <p className={styles.statValue}>{isLoading ? 'Loading…' : formatCurrency(inventoryValue)}</p>
          <span className={styles.statTrend}>{balances.length.toLocaleString()} stock records</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Customers</h3>
            <div className={`${styles.statIcon} ${styles.iconCustomers}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <p className={styles.statValue}>{isLoading ? 'Loading…' : customersRaw.length.toLocaleString()}</p>
          <span className={`${styles.statTrend} ${styles.negative}`}>Live customer count</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              Revenue Trend
              <span className={styles.sectionHint}>Last 7 days in the selected range</span>
            </div>
            <div className={styles.graphContainer}>
              {graphData.length === 0 ? (
                <div className={styles.emptyState}>
                  {isLoading ? 'Loading revenue data…' : 'No revenue data available for this period.'}
                </div>
              ) : (
                graphData.map((point) => (
                  <div key={`${point.label}-${point.revenue}`} className={styles.barCol}>
                    <div className={styles.barWrapper}>
                      <div
                        className={styles.barFill}
                        style={{ height: `${Math.max((point.value / graphMax) * 100, 4)}%` }}
                      />
                      <span className={styles.barValue}>{formatCurrency(point.revenue)}</span>
                    </div>
                    <span className={styles.barLabel}>{point.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>Recent Activity</div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5}>
                        <div className={styles.tableLoading}>Loading recent sales…</div>
                      </td>
                    </tr>
                  ) : recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className={styles.emptyState}>No sales found for the selected filters.</div>
                      </td>
                    </tr>
                  ) : (
                    recentSales.map((sale) => {
                      const statusClass = styles[sale.status as keyof typeof styles] ?? styles.processing;
                      const customer = sale.customer_id ? customersMap[sale.customer_id] : undefined;

                      return (
                        <tr key={sale.id}>
                          <td style={{ fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                            {sale.sale_number}
                          </td>
                          <td>{getCustomerName(customer)}</td>
                          <td>{formatDateTime(sale.completed_at ?? sale.created_at)}</td>
                          <td>
                            <span className={`${styles.badge} ${statusClass}`}>
                              {STATUS_LABELS[sale.status]}
                            </span>
                          </td>
                          <td>{formatCurrency(sale.total_amount ?? 0)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>Alerts</div>
            <div className={styles.alertsContainer}>
              {lowStockAlerts.length === 0 ? (
                <div className={styles.emptyState}>
                  {isLoading ? 'Loading stock alerts…' : 'No urgent stock alerts right now.'}
                </div>
              ) : (
                lowStockAlerts.map((item) => {
                  const isCritical = item.available <= 2;
                  return (
                    <div
                      key={item.product.id}
                      className={`${styles.alertItem} ${isCritical ? styles.critical : ''}`}
                    >
                      <div className={styles.alertIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isCritical ? '#EF4444' : '#F59E0B'} strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <div className={styles.alertContent}>
                        <h4>{isCritical ? 'Critical Low Stock' : 'Low Stock Alert'}</h4>
                        <p>
                          {item.product.name} is down to {item.available} unit{item.available === 1 ? '' : 's'} available.
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>Top Products</div>
            <ul className={styles.productList}>
              {topProductsLoading ? (
                <li className={styles.productItem}>
                  <span className={styles.emptyState}>Loading top products…</span>
                </li>
              ) : topProducts.length === 0 ? (
                <li className={styles.productItem}>
                  <span className={styles.emptyState}>No product sales in this period.</span>
                </li>
              ) : (
                topProducts.map((product) => (
                  <li key={product.product_id} className={styles.productItem}>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.product_name}</span>
                      <span className={styles.productSales}>
                        SKU {product.sku} · {product.quantity_sold} sold
                      </span>
                    </div>
                    <span className={styles.productRevenue}>{formatCurrency(product.revenue)}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
