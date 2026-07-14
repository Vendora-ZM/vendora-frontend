'use client';

import React, { useMemo, useState } from 'react';
import { useGetBalancesQuery, useGetMovementsQuery } from '@/lib/features/inventory/inventoryApi';
import { useGetProductsQuery } from '@/lib/features/products/productsApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { BalancesTable } from '@/components/inventory/BalancesTable';
import { MovementsTable } from '@/components/inventory/MovementsTable';
import { AdjustStockModal } from '@/components/inventory/AdjustStockModal';
import { TransferStockModal } from '@/components/inventory/TransferStockModal';
import { Product } from '@/types/product';
import styles from './inventory.module.css';

type Tab = 'balances' | 'movements';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('balances');

  const { data: balances = [], isLoading: balancesLoading } = useGetBalancesQuery({});
  const { data: movements = [], isLoading: movementsLoading } = useGetMovementsQuery({ limit: 100 });
  const { data: productsRaw = [] } = useGetProductsQuery({});
  const { data: locationsRaw = [] } = useGetLocationsQuery();

  // Build lookup maps for fast rendering
  const productsMap = useMemo(
    () => Object.fromEntries(productsRaw.map((p: Product) => [p.id, p])),
    [productsRaw]
  );
  const locationsMap = useMemo(
    () => Object.fromEntries(locationsRaw.map((l) => [l.id, l.name])),
    [locationsRaw]
  );

  // Summary stats
  const totalSkus = balances.length;
  const lowStockCount = balances.filter((b) => parseFloat(b.quantity_available) <= 5).length;
  const outOfStockCount = balances.filter((b) => parseFloat(b.quantity_available) <= 0).length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory</h1>
          <p className={styles.subtitle}>Track stock levels, movements and adjustments across all locations.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(6, 41, 107, 0.08)', color: '#06296B' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
          </div>
          <div>
            <p className={styles.statLabel}>Total SKUs</p>
            <p className={styles.statValue}>{totalSkus}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <p className={styles.statLabel}>Low Stock</p>
            <p className={styles.statValue} style={{ color: '#D97706' }}>{lowStockCount}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div>
            <p className={styles.statLabel}>Out of Stock</p>
            <p className={styles.statValue} style={{ color: '#EF4444' }}>{outOfStockCount}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div>
            <p className={styles.statLabel}>Recent Movements</p>
            <p className={styles.statValue} style={{ color: '#10B981' }}>{movements.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsBar}>
        <button
          className={`${styles.tab} ${activeTab === 'balances' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('balances')}
        >
          Stock Balances
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'movements' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          Movement History
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        {activeTab === 'balances' ? (
          <BalancesTable
            balances={balances}
            products={productsMap}
            locations={locationsMap}
            isLoading={balancesLoading}
          />
        ) : (
          <MovementsTable
            movements={movements}
            products={productsMap}
            locations={locationsMap}
            isLoading={movementsLoading}
          />
        )}
      </div>

      {/* Modals */}
      <AdjustStockModal />
      <TransferStockModal />
    </div>
  );
}
