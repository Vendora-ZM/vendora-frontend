'use client';

import React, { useMemo } from 'react';
import { useAppSelector } from '@/lib/store';
import { useGetTopProductsQuery } from '@/lib/features/analytics/analyticsApi';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { getDateRange } from '@/lib/utils/dateRange';
import { formatCurrencyFromCents } from '@/lib/utils/currency';
import type { TopProductRow } from '@/types/analytics';
import styles from './AnalyticsWidgets.module.css';

export const TopProductsTable: React.FC = () => {
  const { dateRangePreset, locationId } = useAppSelector((s) => s.analytics);
  const { from, to } = useMemo(() => getDateRange(dateRangePreset), [dateRangePreset]);
  const { data: me } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const currencyCode = business?.currency_code;

  const { data = [], isLoading } = useGetTopProductsQuery({ from, to, location_id: locationId, limit: 5 });

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>Top Grossing Products</h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th className={`${styles.rightAlign} ${styles.mobileHideSm}`}>Sold</th>
              <th className={styles.rightAlign}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className={styles.loading}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={3} className={styles.empty}>No sales in this period.</td></tr>
            ) : (
              data.map((row: TopProductRow) => (
                <tr key={row.product_id}>
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.productName}>{row.product_name}</span>
                      <span className={styles.productSku}>Item code (SKU): {row.sku}</span>
                    </div>
                  </td>
                  <td className={`${styles.rightAlign} ${styles.mobileHideSm}`}>{row.quantity_sold}</td>
                  <td className={`${styles.rightAlign} ${styles.revenueVal}`}>
                    {formatCurrencyFromCents(row.revenue, { currencyCode })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

