'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  footer?: React.ReactNode;
}

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className={i === 1 || i === 3 ? styles.hideOnMobile : ''}><div className={styles.skeleton} /></td>
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

export const BalancesTable: React.FC<BalancesTableProps> = ({ balances, products, locations, isLoading, footer }) => {
  const dispatch = useAppDispatch();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.productColumn}>Product</th>
              <th className={styles.hideOnMobile}>Location</th>
              <th>On Hand</th>
              <th className={styles.hideOnMobile}>Reserved</th>
              <th>Available</th>
              <th className={styles.actionsColumn}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : balances.length === 0
                ? <EmptyState />
                : balances.map((balance) => {
                    const product = products[balance.product_id];
                    const locationName = locations[balance.location_id] || 'Unknown location';
                    const available = parseFloat(balance.quantity_available);
                    const isLow = available <= 0;
                    const rowId = balance.id || `${balance.product_id}-${balance.location_id}`;
                    const isMenuOpen = openMenuId === rowId;

                    return (
                      <tr key={rowId} className={styles.row}>
                        <td className={styles.productColumn}>
                          <div className={styles.productCell}>
                            <span className={styles.productName}>{product?.name || 'Unknown product'}</span>
                            <span className={styles.productSku}>Item code: {product?.sku || 'N/A'}</span>
                          </div>
                        </td>
                        <td className={styles.hideOnMobile}>{locationName}</td>
                        <td className={styles.qtyCell}>{parseFloat(balance.quantity_on_hand)}</td>
                        <td className={`${styles.qtyCell} ${styles.hideOnMobile}`}>{parseFloat(balance.quantity_reserved)}</td>
                        <td className={`${styles.qtyCell} ${styles.qtyAvailable} ${isLow ? styles.qtyLow : ''}`}>
                          {available}
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionsMenu} ref={isMenuOpen ? menuRef : null}>
                            <button
                              type="button"
                              className={styles.menuTrigger}
                              aria-label={`Open actions for ${product?.name || 'product'}`}
                              aria-expanded={isMenuOpen}
                              onClick={() => setOpenMenuId((current) => current === rowId ? null : rowId)}
                            >
                              <span aria-hidden="true">⋮</span>
                            </button>

                            {isMenuOpen ? (
                              <div className={styles.menuDialog} role="dialog" aria-label={`Actions for ${product?.name || 'product'}`}>
                                <button
                                  type="button"
                                  className={styles.menuItem}
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    dispatch(openAdjustModal(balance.product_id));
                                  }}
                                >
                                  Adjust stock
                                </button>
                                <button
                                  type="button"
                                  className={styles.menuItem}
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    dispatch(openTransferModal(balance.product_id));
                                  }}
                                >
                                  Transfer stock
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </td>
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
