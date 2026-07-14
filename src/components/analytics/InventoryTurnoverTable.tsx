'use client';

import React, { useMemo } from 'react';
import { useAppSelector } from '@/lib/store';
import { useGetInventoryTurnoverQuery } from '@/lib/features/analytics/analyticsApi';
import { getDateRange } from '@/lib/utils/dateRange';
import styles from './AnalyticsWidgets.module.css';

export const InventoryTurnoverTable: React.FC = () => {
  const { dateRangePreset, locationId } = useAppSelector((s) => s.analytics);
  const { from, to } = useMemo(() => getDateRange(dateRangePreset), [dateRangePreset]);

  const { data = [], isLoading } = useGetInventoryTurnoverQuery({ from, to, location_id: locationId, limit: 5 });

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>Highest Inventory Turnover</h3>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th className={styles.rightAlign}>Sold</th>
              <th className={styles.rightAlign}>Avg. Stock</th>
              <th className={styles.rightAlign}>Turnover</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className={styles.loading}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={4} className={styles.empty}>No inventory data in this period.</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.product_id}>
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.productName}>{row.product_name}</span>
                    </div>
                  </td>
                  <td className={styles.rightAlign}>{row.quantity_sold}</td>
                  <td className={styles.rightAlign}>{parseFloat(row.avg_on_hand).toFixed(1)}</td>
                  <td className={`${styles.rightAlign} ${styles.turnoverVal}`}>
                    {parseFloat(row.turnover_rate).toFixed(2)}
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
