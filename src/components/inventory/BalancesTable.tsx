'use client';

import React from 'react';
import { InventoryBalance } from '@/types/inventory';
import { Product } from '@/types/product';
import { useAppDispatch } from '@/lib/store';
import { openAdjustModal, openTransferModal } from '@/lib/features/inventory/inventorySlice';
import styles from './BalancesTable.module.css';

interface BalancesTableProps {
  balances: InventoryBalance[];
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
          <div className={styles.emptyIcon}>📦</div>
          <h3 className={styles.emptyTitle}>No inventory balances</h3>
          <p className={styles.emptySubtitle}>
            Add stock to your products to see them here.
          </p>
        </div>
      </td>
    </tr>
  );
}

export const BalancesTable: React.FC<BalancesTableProps> = ({ balances, products, locations, isLoading }) => {
  const dispatch = useAppDispatch();

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Location</th>
            <th>On Hand</th>
            <th>Reserved</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : balances.length === 0
            ? <EmptyState />
            : balances.map((balance) => {
                const product = products[balance.product_id];
                const locationName = locations[balance.location_id] || 'Unknown Location';
                const available = parseFloat(balance.quantity_available);
                const isLow = available <= 0;

                return (
                  <tr key={balance.id || `${balance.product_id}-${balance.location_id}`} className={styles.row}>
                    <td>
                      <div className={styles.productCell}>
                        <span className={styles.productName}>{product?.name || 'Unknown Product'}</span>
                        <span className={styles.productSku}>Item code (SKU): {product?.sku || 'N/A'}</span>
                      </div>
                    </td>
                    <td>{locationName}</td>
                    <td className={styles.qtyCell}>{parseFloat(balance.quantity_on_hand)}</td>
                    <td className={styles.qtyCell}>{parseFloat(balance.quantity_reserved)}</td>
                    <td className={`${styles.qtyCell} ${styles.qtyAvailable} ${isLow ? styles.qtyLow : ''}`}>
                      {available}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => dispatch(openAdjustModal(balance.product_id))}
                        >
                          Adjust
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => dispatch(openTransferModal(balance.product_id))}
                        >
                          Transfer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
          }
        </tbody>
      </table>
    </div>
  );
};
