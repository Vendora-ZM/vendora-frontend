'use client';

import React from 'react';
import { Product } from '@/types/product';
import { useAppDispatch } from '@/lib/store';
import { openEditModal, openDeleteModal } from '@/lib/features/products/productsSlice';
import styles from './ProductsTable.module.css';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  categoryMap: Record<string, string>;
}

function PriceDisplay({ value }: { value: number }) {
  const num = value / 100;
  return <span>{isNaN(num) ? '—' : `$${num.toFixed(2)}`}</span>;
}

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i}><div className={styles.skeleton} /></td>
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

export const ProductsTable: React.FC<ProductsTableProps> = ({ products, isLoading, categoryMap }) => {
  const dispatch = useAppDispatch();

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Selling Price</th>
            <th>Cost Price</th>
            <th>Unit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : products.length === 0
            ? <EmptyState />
            : products.map((product) => (
                <tr key={product.id} className={styles.row}>
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productSku}>SKU: {product.sku}</span>
                    </div>
                  </td>
                  <td className={styles.categoryCell}>
                    {product.category_id ? (
                      <span className={styles.categoryBadge}>
                        {categoryMap[product.category_id] ?? '—'}
                      </span>
                    ) : (
                      <span className={styles.noCategory}>Uncategorised</span>
                    )}
                  </td>
                  <td><PriceDisplay value={product.selling_price} /></td>
                  <td><PriceDisplay value={product.cost_price} /></td>
                  <td className={styles.unitCell}>{product.unit || '—'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${product.is_active ? styles.active : styles.inactive}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        title="Add/Adjust Stock"
                        aria-label={`Adjust Stock for ${product.name}`}
                        onClick={() => {
                          import('@/lib/features/inventory/inventorySlice').then(({ openAdjustModal }) => {
                            dispatch(openAdjustModal(product.id));
                          });
                        }}
                      >
                        ➕
                      </button>
                      <button
                        className={styles.actionBtn}
                        title="Edit product"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => dispatch(openEditModal(product))}
                      >
                        ✏️
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Delete product"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => dispatch(openDeleteModal(product))}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
};
