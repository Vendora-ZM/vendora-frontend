'use client';

import React from 'react';
import { AnalyticsToolbar } from '@/components/analytics/AnalyticsToolbar';
import { SalesTrendChart } from '@/components/analytics/SalesTrendChart';
import { TopProductsTable } from '@/components/analytics/TopProductsTable';
import { InventoryTurnoverTable } from '@/components/analytics/InventoryTurnoverTable';
import styles from './page.module.css';

export default function AnalyticsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>Track your sales performance and inventory health.</p>
        </div>
      </div>

      <AnalyticsToolbar />
      
      <div className={styles.grid}>
        <div className={styles.fullWidth}>
          <SalesTrendChart />
        </div>
        
        <div className={styles.halfWidth}>
          <TopProductsTable />
        </div>
        
        <div className={styles.halfWidth}>
          <InventoryTurnoverTable />
        </div>
      </div>
    </div>
  );
}
