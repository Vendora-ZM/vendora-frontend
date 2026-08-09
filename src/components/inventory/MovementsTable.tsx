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
}

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i}><div className={styles.skeleton} /></td>
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

export const MovementsTable: React.FC<MovementsTableProps> = ({ movements, products, locations, isLoading }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Product</th>
            <th>Location</th>
            <th>Delta</th>
            <th>Balance After</th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : movements.length === 0
            ? <EmptyState />
            : movements.map((movement) => {
                const product = products[movement.product_id];
                const locationName = locations[movement.location_id] || 'Unknown';
                const delta = parseFloat(movement.quantity_delta);
                const isPositive = delta > 0;

                return (
                  <tr key={movement.id} className={styles.row}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      {formatDate(movement.created_at)}
                    </td>
                    <td>
                      <span className={styles.statusBadge} style={{ 
                        background: 'rgba(140,144,152,0.1)', 
                        color: 'var(--color-dark-grey)' 
                      }}>
                        {getMovementTypeLabel(movement.movement_type)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.productCell}>
                        <span className={styles.productName}>{product?.name || 'Unknown Product'}</span>
                        <span className={styles.productSku}>Item code (SKU): {product?.sku || 'N/A'}</span>
                      </div>
                    </td>
                    <td>{locationName}</td>
                    <td className={styles.qtyCell} style={{ color: isPositive ? '#10B981' : '#EF4444' }}>
                      {isPositive ? '+' : ''}{delta}
                    </td>
                    <td className={styles.qtyCell}>{parseFloat(movement.quantity_after)}</td>
                  </tr>
                );
              })
          }
        </tbody>
      </table>
    </div>
  );
};
