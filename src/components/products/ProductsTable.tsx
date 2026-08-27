'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useAppDispatch } from '@/lib/store';
import { openDeleteModal } from '@/lib/features/products/productsSlice';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { formatCurrencyFromCents } from '@/lib/utils/currency';
import styles from './ProductsTable.module.css';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  categoryMap: Record<string, string>;
  footer?: React.ReactNode;
}

function PriceDisplay({ value, currencyCode }: { value: number; currencyCode?: string }) {
  return <span>{formatCurrencyFromCents(value, { currencyCode })}</span>;
}

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className={i === 1 || i === 3 || i === 4 ? styles.hideOnMobile : ''}>
          <div className={styles.skeleton} />
        </td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={7}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3 className={styles.emptyTitle}>No products found</h3>
          <p className={styles.emptySubtitle}>
            Add your first product or try adjusting your search and filters.
          </p>
        </div>
      </td>
    </tr>
  );
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ products, isLoading, categoryMap, footer }) => {
  const dispatch = useAppDispatch();
  const { data: me } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const currencyCode = business?.currency_code;
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

  const openAdjustStock = (productId: string) => {
    import('@/lib/features/inventory/inventorySlice').then(({ openAdjustModal }) => {
      dispatch(openAdjustModal(productId));
    });
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.productColumn}>Product</th>
              <th className={styles.hideOnMobile}>Category</th>
              <th>Selling Price</th>
              <th className={styles.hideOnMobile}>Cost Price</th>
              <th className={styles.hideOnMobile}>Unit</th>
              <th>Status</th>
              <th className={styles.actionsColumn}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : products.length === 0
              ? <EmptyState />
              : products.map((product) => {
                  const isMenuOpen = openMenuId === product.id;

                  return (
                    <tr key={product.id} className={styles.row}>
                      <td className={styles.productColumn}>
                        <div className={styles.productCell}>
                          <span className={styles.productName}>{product.name}</span>
                          <span className={styles.productSku}>Item code: {product.sku}</span>
                        </div>
                      </td>
                      <td className={styles.hideOnMobile}>
                        {product.category_id ? (
                          <span className={styles.categoryBadge}>
                            {categoryMap[product.category_id] ?? '—'}
                          </span>
                        ) : (
                          <span className={styles.noCategory}>Uncategorised</span>
                        )}
                      </td>
                      <td><PriceDisplay value={product.selling_price} currencyCode={currencyCode} /></td>
                      <td className={styles.hideOnMobile}><PriceDisplay value={product.cost_price} currencyCode={currencyCode} /></td>
                      <td className={`${styles.unitCell} ${styles.hideOnMobile}`}>{product.unit || '—'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${product.is_active ? styles.active : styles.inactive}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionsMenu} ref={isMenuOpen ? menuRef : null}>
                          <button
                            type="button"
                            className={styles.menuTrigger}
                            aria-label={`Open actions for ${product.name}`}
                            aria-expanded={isMenuOpen}
                            onClick={() => setOpenMenuId((current) => current === product.id ? null : product.id)}
                          >
                            <span aria-hidden="true">⋮</span>
                          </button>

                          {isMenuOpen ? (
                            <div className={styles.menuDialog} role="dialog" aria-label={`Actions for ${product.name}`}>
                              <button
                                type="button"
                                className={styles.menuItem}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openAdjustStock(product.id);
                                }}
                              >
                                Add stock
                              </button>
                              <Link
                                className={styles.menuItem}
                                href={`/dashboard/products/${product.id}/edit`}
                                onClick={() => setOpenMenuId(null)}
                              >
                                Edit
                              </Link>
                              <button
                                type="button"
                                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  dispatch(openDeleteModal(product));
                                }}
                              >
                                Delete
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
