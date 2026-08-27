'use client';

import React from 'react';
import { InventoryMovement } from '@/types/inventory';
import { Product } from '@/types/product';
import styles from './BalancesTable.module.css';

interface MovementsTableProps {
  movements: InventoryMovement[];
  products: Record<string, Product>;
  locations: Record<string, string>;
  isLoading: boolean;
  footer?: React.ReactNode;
}

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className={i === 3 || i === 5 ? styles.hideOnMobile : ''}><div className={styles.skeleton} /></td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={6}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3 className={styles.emptyTitle}>No inventory movements</h3>
          <p className={styles.emptySubtitle}>
            Stock adjustments, transfers, and sales will appear here.
          </p>
        </div>
      </td>
    </tr>
  );
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function getMovementTypeLabel(type: string) {
  const map: Record<string, string> = {
    receive: 'Received',
    adjust: 'Adjusted',
    sale: 'Sale',
    refund: 'Refund',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
  };
  return map[type] || type;
}

export const MovementsTable: React.FC<MovementsTableProps> = ({ movements, products, locations, isLoading, footer }) => {
  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.dateColumn}>Date</th>
              <th>Type</th>
              <th className={styles.productColumn}>Product</th>
              <th className={styles.hideOnMobile}>Location</th>
              <th>Delta</th>
              <th className={styles.hideOnMobile}>Balance After</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : movements.length === 0
                ? <EmptyState />
                : movements.map((movement) => {
                    const product = products[movement.product_id];
                    const locationName = locations[movement.location_id] || 'Unknown location';
                    const delta = parseFloat(movement.quantity_delta);
                    const isPositive = delta > 0;

                    return (
                      <tr key={movement.id} className={styles.row}>
                        <td className={styles.dateCell}>{formatDate(movement.created_at)}</td>
                        <td>
                          <span className={styles.statusBadge}>
                            {getMovementTypeLabel(movement.movement_type)}
                          </span>
                        </td>
                        <td className={styles.productColumn}>
                          <div className={styles.productCell}>
                            <span className={styles.productName}>{product?.name || 'Unknown product'}</span>
                            <span className={styles.productSku}>Item code: {product?.sku || 'N/A'}</span>
                          </div>
                        </td>
                        <td className={styles.hideOnMobile}>{locationName}</td>
                        <td className={`${styles.qtyCell} ${isPositive ? styles.qtyPositive : styles.qtyNegative}`}>
                          {isPositive ? '+' : ''}{delta}
                        </td>
                        <td className={`${styles.qtyCell} ${styles.hideOnMobile}`}>{parseFloat(movement.quantity_after)}</td>
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
};
