'use client';

import React, { useMemo, useState } from 'react';
import {
  useGetBalancesQuery,
  useGetMovementsQuery,
  useGetPaginatedBalancesQuery,
  useGetPaginatedMovementsQuery,
} from '@/lib/features/inventory/inventoryApi';
import { useGetProductsQuery } from '@/lib/features/products/productsApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { BalancesTable } from '@/components/inventory/BalancesTable';
import { MovementsTable } from '@/components/inventory/MovementsTable';
import { AdjustStockModal } from '@/components/inventory/AdjustStockModal';
import { TransferStockModal } from '@/components/inventory/TransferStockModal';
import { Product } from '@/types/product';
import type { InventoryBalance, InventoryMovement } from '@/types/inventory';
import type { Location } from '@/types/location';
import styles from './inventory.module.css';

type Tab = 'balances' | 'movements';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('balances');
  const [balancePage, setBalancePage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const balancePageSize = 10;
  const movementPageSize = 10;

  const { data: balances = [], isLoading: balancesLoading } = useGetBalancesQuery({});
  const { data: movements = [], isLoading: movementsLoading } = useGetMovementsQuery({ limit: 100 });
  const { data: productsRaw = [] } = useGetProductsQuery({});
  const { data: locationsRaw = [] } = useGetLocationsQuery();
  const {
    data: paginatedBalancesResponse,
    isLoading: paginatedBalancesLoading,
  } = useGetPaginatedBalancesQuery({
    limit: balancePageSize,
    offset: (balancePage - 1) * balancePageSize,
  });
  const {
    data: paginatedMovementsResponse,
    isLoading: paginatedMovementsLoading,
  } = useGetPaginatedMovementsQuery({
    limit: movementPageSize,
    offset: (movementPage - 1) * movementPageSize,
  });

  const productsMap = useMemo(
    () => Object.fromEntries(productsRaw.map((p: Product) => [p.id, p])),
    [productsRaw]
  );
  const locationsMap = useMemo(
    () => Object.fromEntries(locationsRaw.map((l: Location) => [l.id, l.name])),
    [locationsRaw]
  );

  const sortedBalances = useMemo(() => [...balances], [balances]);
  const sortedMovements = useMemo(
    () => [...movements].sort((a: InventoryMovement, b: InventoryMovement) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [movements]
  );

  const paginatedBalances = paginatedBalancesResponse?.data ?? [];
  const paginatedMovements = paginatedMovementsResponse?.data ?? [];
  const balanceTotal = paginatedBalancesResponse?.meta.total ?? sortedBalances.length;
  const movementTotal = paginatedMovementsResponse?.meta.total ?? sortedMovements.length;
  const balanceTotalPages = Math.max(1, paginatedBalancesResponse?.meta.total_pages ?? Math.ceil(balanceTotal / balancePageSize));
  const movementTotalPages = Math.max(1, paginatedMovementsResponse?.meta.total_pages ?? Math.ceil(movementTotal / movementPageSize));
  const balancesTableLoading = balancesLoading || paginatedBalancesLoading;
  const movementsTableLoading = movementsLoading || paginatedMovementsLoading;

  const totalSkus = balances.length;
  const lowStockCount = balances.filter((b: InventoryBalance) => parseFloat(b.quantity_available) <= 5).length;
  const outOfStockCount = balances.filter((b: InventoryBalance) => parseFloat(b.quantity_available) <= 0).length;

  const advancedInventory = useMemo(() => {
    const movementByProduct = new Map<string, number>();
    const movementByType = new Map<string, number>();
    const recentMovementProductIds = new Set<string>();

    movements.forEach((movement: InventoryMovement) => {
      const delta = Math.abs(parseFloat(movement.quantity_delta || '0'));
      movementByProduct.set(movement.product_id, (movementByProduct.get(movement.product_id) ?? 0) + delta);
      movementByType.set(movement.movement_type, (movementByType.get(movement.movement_type) ?? 0) + 1);
      recentMovementProductIds.add(movement.product_id);
    });

    const lowStockBalances = balances
      .map((balance: InventoryBalance) => {
        const product = productsMap[balance.product_id];
        const available = Number.parseFloat(balance.quantity_available || '0');
        return product ? { product, available } : null;
      })
      .filter((item: { product: Product; available: number } | null): item is { product: Product; available: number } => item !== null)
      .filter((item: { product: Product; available: number }) => item.available <= 5)
      .sort((a: { product: Product; available: number }, b: { product: Product; available: number }) => a.available - b.available)
      .slice(0, 3);

    const quietStock = balances
      .map((balance: InventoryBalance) => {
        const product = productsMap[balance.product_id];
        const available = Number.parseFloat(balance.quantity_available || '0');
        return product ? { product, available, productId: balance.product_id } : null;
      })
      .filter(
        (item: { product: Product; available: number; productId: string } | null): item is { product: Product; available: number; productId: string } =>
          item !== null
      )
      .filter((item: { product: Product; available: number; productId: string }) => !recentMovementProductIds.has(item.productId) && item.available > 0)
      .sort((a: { product: Product; available: number; productId: string }, b: { product: Product; available: number; productId: string }) => b.available - a.available)
      .slice(0, 3);

    const mostActiveProductId = [...movementByProduct.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostActiveProduct = mostActiveProductId ? productsMap[mostActiveProductId] : undefined;
    const mostActiveMovementCount = mostActiveProductId ? movementByProduct.get(mostActiveProductId) ?? 0 : 0;

    const movementTypeRows = [...movementByType.entries()]
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .map(([type, count]: [string, number]) => ({ type, count }))
      .slice(0, 4);

    const aiSummary = (() => {
      if (lowStockBalances.length > 0) {
        const [first] = lowStockBalances;
        return `${first.product.name} is the clearest reorder candidate with ${first.available} unit${first.available === 1 ? '' : 's'} left.`;
      }
      if (mostActiveProduct) {
        return `${mostActiveProduct.name} is the most active item in the current movement window, with ${mostActiveMovementCount.toFixed(0)} units moving.`;
      }
      return 'Inventory looks calm right now. As more movement data builds up, Vendora will surface reorder and dead-stock patterns here.';
    })();

    return {
      lowStockBalances,
      quietStock,
      movementTypeRows,
      mostActiveProduct,
      mostActiveMovementCount,
      aiSummary,
    };
  }, [balances, movements, productsMap]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory</h1>
          <p className={styles.subtitle}>Track stock levels, item movement, and restocking across all locations.</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(6, 41, 107, 0.08)', color: '#06296B' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
          </div>
          <div>
            <p className={styles.statLabel}>Tracked items</p>
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

      <details id="advanced-inventory" className={styles.advancedInventoryCard} open>
        <summary className={styles.advancedInventorySummary}>
          <div>
            <span className={styles.advancedEyebrow}>Advanced Inventory</span>
            <h2 className={styles.advancedTitle}>Deeper stock insights and AI guidance.</h2>
            <p className={styles.advancedText}>
              Use this area to spot reorder risks, quiet items, and movement patterns that deserve attention.
            </p>
          </div>
          <span className={styles.advancedHint}>Built from live balances and recent movement history</span>
        </summary>

        <div className={styles.advancedGrid}>
          <article className={styles.advancedCard}>
            <span className={styles.advancedLabel}>Reorder soon</span>
            <strong className={styles.advancedValue}>{advancedInventory.lowStockBalances.length}</strong>
            <p className={styles.advancedCopy}>Items sitting at five units or fewer.</p>
          </article>

          <article className={styles.advancedCard}>
            <span className={styles.advancedLabel}>Quiet stock</span>
            <strong className={styles.advancedValue}>{advancedInventory.quietStock.length}</strong>
            <p className={styles.advancedCopy}>Items with stock on hand but no recent movement in this window.</p>
          </article>

          <article className={styles.advancedCard}>
            <span className={styles.advancedLabel}>Movement types</span>
            <strong className={styles.advancedValue}>{advancedInventory.movementTypeRows.length}</strong>
            <p className={styles.advancedCopy}>Adjustment, transfer, and other movement patterns in view.</p>
          </article>

          <article className={styles.advancedCard}>
            <span className={styles.advancedLabel}>Most active item</span>
            <strong className={styles.advancedValue}>
              {advancedInventory.mostActiveProduct?.name ?? 'None'}
            </strong>
            <p className={styles.advancedCopy}>
              {advancedInventory.mostActiveProduct
                ? `${advancedInventory.mostActiveMovementCount.toFixed(0)} units moved in the current window.`
                : 'No movement data available yet.'}
            </p>
          </article>
        </div>

        <div className={styles.advancedSplit}>
          <div className={styles.advancedPanel}>
            <h3 className={styles.advancedPanelTitle}>AI inventory notes</h3>
            <p className={styles.advancedPanelCopy}>{advancedInventory.aiSummary}</p>
            <div className={styles.advancedPills}>
              <span className={styles.advancedPill}>Reorder suggestions</span>
              <span className={styles.advancedPill}>Dead stock watch</span>
              <span className={styles.advancedPill}>Movement patterns</span>
            </div>
          </div>

          <div className={styles.advancedPanel}>
            <h3 className={styles.advancedPanelTitle}>Movement mix</h3>
            <div className={styles.movementMixList}>
              {advancedInventory.movementTypeRows.length > 0 ? (
                advancedInventory.movementTypeRows.map((row: { type: string; count: number }) => (
                  <div key={row.type} className={styles.movementMixRow}>
                    <span>{row.type.replace(/_/g, ' ')}</span>
                    <strong>{row.count}</strong>
                  </div>
                ))
              ) : (
                <p className={styles.advancedPanelCopy}>No movement patterns have been recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.advancedSplit}>
          <div className={styles.advancedPanel}>
            <h3 className={styles.advancedPanelTitle}>Items to watch</h3>
            <div className={styles.watchList}>
              {advancedInventory.lowStockBalances.length > 0 ? (
                advancedInventory.lowStockBalances.map((item: { product: Product; available: number }) => (
                  <div key={item.product.id} className={styles.watchItem}>
                    <strong>{item.product.name}</strong>
                    <span>{item.available} units available</span>
                  </div>
                ))
              ) : (
                <p className={styles.advancedPanelCopy}>No urgent reorder items right now.</p>
              )}
            </div>
          </div>

          <div className={styles.advancedPanel}>
            <h3 className={styles.advancedPanelTitle}>Quiet stock</h3>
            <div className={styles.watchList}>
              {advancedInventory.quietStock.length > 0 ? (
                advancedInventory.quietStock.map((item: { product: Product; available: number; productId: string }) => (
                  <div key={item.product.id} className={styles.watchItem}>
                    <strong>{item.product.name}</strong>
                    <span>{item.available} units on hand, no recent movement</span>
                  </div>
                ))
              ) : (
                <p className={styles.advancedPanelCopy}>Nothing is sitting idle in the current movement window.</p>
              )}
            </div>
          </div>
        </div>
      </details>

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

      <div className={styles.tableContainer}>
        {activeTab === 'balances' ? (
          <BalancesTable
            balances={paginatedBalances}
            products={productsMap}
            locations={locationsMap}
            isLoading={balancesTableLoading}
            footer={!balancesTableLoading && balanceTotal > 0 ? (
              <div className={styles.paginationFooter}>
                <div className={styles.paginationSummary}>
                  Showing {Math.min((balancePage - 1) * balancePageSize + 1, balanceTotal)}-
                  {Math.min(balancePage * balancePageSize, balanceTotal)} of {balanceTotal}
                </div>
                <div className={styles.paginationControls}>
                  <button
                    type="button"
                    className={styles.paginationButton}
                    onClick={() => setBalancePage((page) => Math.max(1, page - 1))}
                    disabled={balancePage <= 1}
                  >
                    Previous
                  </button>
                  <div className={styles.paginationPages} aria-label="Inventory balance pages">
                    {Array.from({ length: balanceTotalPages }, (_, index) => index + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`${styles.paginationButton} ${page === balancePage ? styles.paginationButtonActive : ''}`}
                        onClick={() => setBalancePage(page)}
                        aria-current={page === balancePage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.paginationButton}
                    onClick={() => setBalancePage((page) => Math.min(balanceTotalPages, page + 1))}
                    disabled={balancePage >= balanceTotalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          />
        ) : (
          <MovementsTable
            movements={paginatedMovements}
            products={productsMap}
            locations={locationsMap}
            isLoading={movementsTableLoading}
            footer={!movementsTableLoading && movementTotal > 0 ? (
              <div className={styles.paginationFooter}>
                <div className={styles.paginationSummary}>
                  Showing {Math.min((movementPage - 1) * movementPageSize + 1, movementTotal)}-
                  {Math.min(movementPage * movementPageSize, movementTotal)} of {movementTotal}
                </div>
                <div className={styles.paginationControls}>
                  <button
                    type="button"
                    className={styles.paginationButton}
                    onClick={() => setMovementPage((page) => Math.max(1, page - 1))}
                    disabled={movementPage <= 1}
                  >
                    Previous
                  </button>
                  <div className={styles.paginationPages} aria-label="Inventory movement pages">
                    {Array.from({ length: movementTotalPages }, (_, index) => index + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`${styles.paginationButton} ${page === movementPage ? styles.paginationButtonActive : ''}`}
                        onClick={() => setMovementPage(page)}
                        aria-current={page === movementPage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.paginationButton}
                    onClick={() => setMovementPage((page) => Math.min(movementTotalPages, page + 1))}
                    disabled={movementPage >= movementTotalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          />
        )}
      </div>

      <AdjustStockModal />
      <TransferStockModal />
    </div>
  );
}
