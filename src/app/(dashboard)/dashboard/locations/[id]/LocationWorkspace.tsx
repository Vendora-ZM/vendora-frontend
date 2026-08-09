'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { skipToken } from '@reduxjs/toolkit/query';
import { useParams } from 'next/navigation';
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetSalesTrendsQuery, useGetTopProductsQuery, useGetInventoryTurnoverQuery } from '@/lib/features/analytics/analyticsApi';
import { useGetBalancesQuery } from '@/lib/features/inventory/inventoryApi';
import { useGetProductsQuery } from '@/lib/features/products/productsApi';
import { useGetSalesQuery } from '@/lib/features/sales/salesApi';
import { useGetCustomersQuery } from '@/lib/features/customers/customersApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { DateRangePreset } from '@/lib/features/analytics/analyticsSlice';
import { getDateRange } from '@/lib/utils/dateRange';
import { Product } from '@/types/product';
import { Customer } from '@/types/customer';
import { Sale, SaleStatus } from '@/types/sale';
import styles from './page.module.css';

export type LocationWorkspaceView = 'overview' | 'products' | 'sales' | 'inventory' | 'customers';

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
];

const VIEW_LINKS: { value: LocationWorkspaceView; label: string; description: string; hrefSuffix?: string }[] = [
  { value: 'overview', label: 'Overview', description: 'Branch summary and trends', hrefSuffix: '' },
  { value: 'products', label: 'Products', description: 'Top products sold at this branch', hrefSuffix: '/products' },
  { value: 'sales', label: 'Sales', description: 'Recent transactions for this branch', hrefSuffix: '/sales' },
  { value: 'inventory', label: 'Inventory', description: 'Stock and turnover for this branch', hrefSuffix: '/inventory' },
  { value: 'customers', label: 'Customers', description: 'Customers who purchased here', hrefSuffix: '/customers' },
];

const STATUS_LABELS: Record<SaleStatus, string> = {
  draft: 'Draft',
  completed: 'Completed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

function formatMoney(cents: number) {
  return `K${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface LocationWorkspaceProps {
  view: LocationWorkspaceView;
}

export function LocationWorkspace({ view }: LocationWorkspaceProps) {
  const params = useParams<{ id?: string | string[] }>();
  const locationId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('last_30_days');

  const { data: locations = [], isLoading: isLocationsLoading } = useGetLocationsQuery();
  const { data: me } = useGetMeQuery();
  const { data: customersRaw = [] } = useGetCustomersQuery({});
  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === locationId) ?? null,
    [locations, locationId]
  );
  const canManageLocations = Boolean(me?.permissions?.includes('locations.manage'));
  const canLoadAnalytics = !isLocationsLoading && Boolean(selectedLocation);
  const { from, to } = useMemo(() => getDateRange(dateRangePreset), [dateRangePreset]);

  const analyticsArgs = canLoadAnalytics ? { from, to, location_id: locationId } : skipToken;
  const { data: salesTrends = [], isLoading: trendsLoading } = useGetSalesTrendsQuery(analyticsArgs);
  const { data: topProducts = [], isLoading: topProductsLoading } = useGetTopProductsQuery(
    canLoadAnalytics ? { from, to, location_id: locationId, limit: 5 } : skipToken
  );
  const { data: turnoverRows = [], isLoading: turnoverLoading } = useGetInventoryTurnoverQuery(
    canLoadAnalytics ? { from, to, location_id: locationId, limit: 5 } : skipToken
  );
  const { data: recentSalesResponse, isLoading: salesLoading } = useGetSalesQuery(
    canLoadAnalytics ? { location_id: locationId, start_date: from, end_date: to, limit: 100, offset: 0 } : skipToken
  );
  const { data: balances = [], isLoading: balancesLoading } = useGetBalancesQuery(
    canLoadAnalytics ? { location_id: locationId } : skipToken
  );
  const { data: productsRaw = [] } = useGetProductsQuery({});

  const productsMap = useMemo(
    () => Object.fromEntries(productsRaw.map((product: Product) => [product.id, product])),
    [productsRaw]
  );

  const chartData = useMemo(() => {
    return salesTrends
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((row) => ({
        date: formatDate(row.date),
        revenue: row.revenue / 100,
        profit: (row.revenue - row.cost - row.refund_amount) / 100,
      }));
  }, [salesTrends]);

  const totalRevenue = salesTrends.reduce((sum, row) => sum + row.revenue, 0);
  const totalCost = salesTrends.reduce((sum, row) => sum + row.cost, 0);
  const totalRefunds = salesTrends.reduce((sum, row) => sum + row.refund_amount, 0);
  const totalProfit = totalRevenue - totalCost - totalRefunds;
  const totalSales = salesTrends.reduce((sum, row) => sum + row.sale_count, 0);
  const totalRefundCount = salesTrends.reduce((sum, row) => sum + row.refund_count, 0);

  const inventoryValue = useMemo(() => {
    return balances.reduce((sum, balance) => {
      const product = productsMap[balance.product_id];
      const quantityOnHand = Number(balance.quantity_on_hand || 0);
      const costPrice = product?.cost_price ?? 0;
      return sum + quantityOnHand * costPrice;
    }, 0);
  }, [balances, productsMap]);

  const lowStockCount = balances.filter((balance) => Number(balance.quantity_available) <= 5).length;

  const recentSales = useMemo(() => {
    const rows = recentSalesResponse?.data ?? [];
    return [...rows].sort((a: Sale, b: Sale) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [recentSalesResponse]);

  const customerSummaries = useMemo(() => {
    const customerMap = new Map<string, { customer: Customer | undefined; sales: number; spend: number; lastOrder: string }>();

    for (const sale of recentSales) {
      if (!sale.customer_id) continue;

      const current = customerMap.get(sale.customer_id) ?? {
        customer: customersRaw.find((customer) => customer.id === sale.customer_id),
        sales: 0,
        spend: 0,
        lastOrder: sale.completed_at ?? sale.created_at,
      };

      current.sales += 1;
      current.spend += sale.total_amount ?? 0;
      const orderTime = sale.completed_at ?? sale.created_at;
      if (new Date(orderTime).getTime() > new Date(current.lastOrder).getTime()) {
        current.lastOrder = orderTime;
      }

      customerMap.set(sale.customer_id, current);
    }

    return [...customerMap.values()].sort((a, b) => b.spend - a.spend);
  }, [customersRaw, recentSales]);

  const isLoading =
    isLocationsLoading ||
    trendsLoading ||
    topProductsLoading ||
    turnoverLoading ||
    salesLoading ||
    balancesLoading;

  if (!isLocationsLoading && !selectedLocation) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Location not found</h1>
            <p className={styles.subtitle}>We could not find a location profile for this identifier.</p>
          </div>
          <Link className={styles.backLink} href="/dashboard/locations">
            Back to locations
          </Link>
        </div>
      </div>
    );
  }

  const activeView = view;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumbs}>
            <Link href="/dashboard/locations">Locations</Link>
            <span>/</span>
            <span>{selectedLocation?.name ?? 'Loading...'}</span>
          </div>
          <h1 className={styles.title}>{selectedLocation?.name ?? 'Location profile'}</h1>
          <p className={styles.subtitle}>
            Focused analytics for this branch across sales, inventory, and product performance.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.periodPicker} aria-label="Analytics period">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`${styles.periodBtn} ${dateRangePreset === preset.value ? styles.periodBtnActive : ''}`}
                onClick={() => setDateRangePreset(preset.value)}
              >
                {preset.label}
              </button>
              ))}
          </div>

          <div className={styles.actionLinks}>
            {canManageLocations ? (
              <Link className={styles.secondaryActionLink} href={`/dashboard/locations/${locationId}/edit`}>
                Edit location
              </Link>
            ) : null}
            <Link className={styles.backLink} href="/dashboard/locations">
              Back to locations
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.viewTabs} aria-label="Location views">
        {VIEW_LINKS.map((button) => {
          const href = button.hrefSuffix ? `/dashboard/locations/${locationId}${button.hrefSuffix}` : `/dashboard/locations/${locationId}`;
          const isActive = activeView === button.value;

          return (
            <Link
              key={button.value}
              href={href}
              className={`${styles.viewTab} ${isActive ? styles.viewTabActive : ''}`}
            >
              <span>{button.label}</span>
              <small>{button.description}</small>
            </Link>
          );
        })}
      </div>

      {activeView === 'overview' && (
        <>
          <section className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <div>
                <h2>{selectedLocation?.name}</h2>
                <p>{selectedLocation?.id}</p>
              </div>
              <span>
                {from} to {to}
              </span>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span>Revenue</span>
                <strong>{isLoading ? 'Loading…' : formatMoney(totalRevenue)}</strong>
              </div>
              <div className={styles.statCard}>
                <span>Profit</span>
                <strong>{isLoading ? 'Loading…' : formatMoney(totalProfit)}</strong>
              </div>
              <div className={styles.statCard}>
                <span>Sales</span>
                <strong>{isLoading ? 'Loading…' : totalSales.toLocaleString()}</strong>
              </div>
              <div className={styles.statCard}>
                <span>Inventory Value</span>
                <strong>{isLoading ? 'Loading…' : formatMoney(inventoryValue)}</strong>
              </div>
            </div>

            <div className={styles.metricsRow}>
              <div className={styles.metricChip}>
                <span>Refunds</span>
                <strong>{totalRefundCount.toLocaleString()}</strong>
              </div>
              <div className={styles.metricChip}>
                <span>Low Stock Items</span>
                <strong>{lowStockCount.toLocaleString()}</strong>
              </div>
              <div className={styles.metricChip}>
                <span>Profit Margin</span>
                <strong>{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%</strong>
              </div>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.panelHeader}>
              <div>
                <h3>Branch Access</h3>
                <span>POS devices and login readiness</span>
              </div>
            </div>

            <div className={styles.metricsRow}>
              <div className={styles.metricChip}>
                <span>POS terminals</span>
                <strong>{selectedLocation?.pos_terminal_limit ?? 1}</strong>
              </div>
              <div className={styles.metricChip}>
                <span>Branch PIN</span>
                <strong>{selectedLocation?.access_pin ? 'Configured' : 'Not set'}</strong>
              </div>
              <div className={styles.metricChip}>
                <span>Mobile login</span>
                <strong>Ready</strong>
              </div>
            </div>

            <p className={styles.sectionNote}>
              Set how many devices can log in for this branch and keep a 4-digit PIN ready for POS and mobile access.
            </p>
          </section>

          <section className={styles.chartCard}>
            <div className={styles.panelHeader}>
              <h3>Revenue Trend</h3>
              <span>
                {from} to {to}
              </span>
            </div>
            <div className={styles.chartContainer}>
              {chartData.length === 0 ? (
                <div className={styles.emptyState}>
                  {isLoading ? 'Loading chart data…' : 'No sales data for this location in the selected period.'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="locationRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A84DD" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1A84DD" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="locationProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#8C9098" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#8C9098" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `K${value}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(value: unknown) => `K${Number(value).toFixed(2)}`}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#1A84DD" strokeWidth={3} fillOpacity={1} fill="url(#locationRevenue)" />
                    <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#locationProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <div className={styles.bottomGrid}>
            <div className={styles.tableCard}>
              <div className={styles.panelHeader}>
                <h3>Top Products</h3>
                <span>By revenue</span>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProductsLoading ? (
                      <tr>
                        <td colSpan={3} className={styles.emptyCell}>
                          Loading…
                        </td>
                      </tr>
                    ) : topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className={styles.emptyCell}>
                          No product sales found.
                        </td>
                      </tr>
                    ) : (
                      topProducts.map((row) => (
                        <tr key={row.product_id}>
                          <td>
                            <div className={styles.productCell}>
                              <span className={styles.productName}>{row.product_name}</span>
                              <span className={styles.productSku}>Item code (SKU): {row.sku}</span>
                            </div>
                          </td>
                          <td>{row.quantity_sold}</td>
                          <td className={styles.revenue}>{formatMoney(row.revenue)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.panelHeader}>
                <h3>Recent Sales</h3>
                <span>Latest transactions</span>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Sale</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesLoading ? (
                      <tr>
                        <td colSpan={3} className={styles.emptyCell}>
                          Loading…
                        </td>
                      </tr>
                    ) : recentSales.length === 0 ? (
                      <tr>
                        <td colSpan={3} className={styles.emptyCell}>
                          No recent sales yet.
                        </td>
                      </tr>
                    ) : (
                      recentSales.map((sale) => (
                        <tr key={sale.id}>
                          <td>
                            <div className={styles.saleCell}>
                              <span className={styles.saleNumber}>{sale.sale_number}</span>
                              <span className={styles.saleDate}>{formatDate(sale.completed_at ?? sale.created_at)}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.badge} ${styles[sale.status] ?? ''}`}>
                              {STATUS_LABELS[sale.status]}
                            </span>
                          </td>
                          <td className={styles.revenue}>{formatMoney(sale.total_amount ?? 0)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <section className={styles.tableCard}>
            <div className={styles.panelHeader}>
              <h3>Inventory Turnover</h3>
              <span>Fastest moving items</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sold</th>
                    <th>Avg On Hand</th>
                    <th>Turnover</th>
                  </tr>
                </thead>
                <tbody>
                  {turnoverLoading ? (
                    <tr>
                      <td colSpan={4} className={styles.emptyCell}>
                        Loading…
                      </td>
                    </tr>
                  ) : turnoverRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.emptyCell}>
                        No turnover data for this location.
                      </td>
                    </tr>
                  ) : (
                    turnoverRows.map((row) => (
                      <tr key={row.product_id}>
                        <td>
                          <div className={styles.productCell}>
                            <span className={styles.productName}>{row.product_name}</span>
                            <span className={styles.productSku}>Item code (SKU): {row.sku}</span>
                          </div>
                        </td>
                        <td>{row.quantity_sold}</td>
                        <td>{row.avg_on_hand}</td>
                        <td className={styles.turnover}>{row.turnover_rate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeView === 'products' && (
        <section className={styles.tableCard}>
          <div className={styles.panelHeader}>
            <h3>Top Products</h3>
            <span>By revenue</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProductsLoading ? (
                  <tr>
                    <td colSpan={3} className={styles.emptyCell}>
                      Loading…
                    </td>
                  </tr>
                ) : topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.emptyCell}>
                      No product sales found.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((row) => (
                    <tr key={row.product_id}>
                      <td>
                        <div className={styles.productCell}>
                          <span className={styles.productName}>{row.product_name}</span>
                          <span className={styles.productSku}>Item code (SKU): {row.sku}</span>
                        </div>
                      </td>
                      <td>{row.quantity_sold}</td>
                      <td className={styles.revenue}>{formatMoney(row.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeView === 'sales' && (
        <section className={styles.tableCard}>
          <div className={styles.panelHeader}>
            <h3>Recent Sales</h3>
            <span>Latest transactions</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sale</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {salesLoading ? (
                  <tr>
                    <td colSpan={3} className={styles.emptyCell}>
                      Loading…
                    </td>
                  </tr>
                ) : recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.emptyCell}>
                      No recent sales yet.
                    </td>
                  </tr>
                ) : (
                  recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <div className={styles.saleCell}>
                          <span className={styles.saleNumber}>{sale.sale_number}</span>
                          <span className={styles.saleDate}>{formatDate(sale.completed_at ?? sale.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[sale.status] ?? ''}`}>{STATUS_LABELS[sale.status]}</span>
                      </td>
                      <td className={styles.revenue}>{formatMoney(sale.total_amount ?? 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeView === 'inventory' && (
        <section className={styles.tableCard}>
          <div className={styles.panelHeader}>
            <h3>Inventory</h3>
            <span>Stock and turnover</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>On Hand</th>
                  <th>Available</th>
                  <th>Turnover</th>
                </tr>
              </thead>
              <tbody>
                {turnoverLoading ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      Loading…
                    </td>
                  </tr>
                ) : balances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      No inventory records found for this location.
                    </td>
                  </tr>
                ) : (
                  balances.map((balance) => {
                    const product = productsMap[balance.product_id];
                    const turnoverRow = turnoverRows.find((row) => row.product_id === balance.product_id);
                    return (
                      <tr key={balance.product_id}>
                        <td>
                          <div className={styles.productCell}>
                            <span className={styles.productName}>{product?.name ?? balance.product_id}</span>
                            <span className={styles.productSku}>Item code (SKU): {product?.sku ?? 'N/A'}</span>
                          </div>
                        </td>
                        <td>{Number(balance.quantity_on_hand || 0)}</td>
                        <td>{Number(balance.quantity_available || 0)}</td>
                        <td className={styles.turnover}>{turnoverRow?.turnover_rate ?? 'N/A'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeView === 'customers' && (
        <section className={styles.tableCard}>
          <div className={styles.panelHeader}>
            <h3>Customers</h3>
            <span>Customers who purchased here</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Spent</th>
                  <th>Last Order</th>
                </tr>
              </thead>
              <tbody>
                {salesLoading ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      Loading…
                    </td>
                  </tr>
                ) : customerSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      No customers found for this location yet.
                    </td>
                  </tr>
                ) : (
                  customerSummaries.map((row) => (
                    <tr key={row.customer?.id ?? row.lastOrder}>
                      <td>
                        <div className={styles.productCell}>
                          <span className={styles.productName}>
                            {row.customer ? `${row.customer.first_name} ${row.customer.last_name}`.trim() : 'Unknown customer'}
                          </span>
                          <span className={styles.productSku}>
                            {row.customer?.email ?? row.customer?.phone ?? 'No contact details'}
                          </span>
                        </div>
                      </td>
                      <td>{row.sales}</td>
                      <td className={styles.revenue}>{formatMoney(row.spend)}</td>
                      <td>{formatDate(row.lastOrder)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
