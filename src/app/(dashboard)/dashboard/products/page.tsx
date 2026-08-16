'use client';

import React, { useMemo } from 'react';
import { useAppSelector } from '@/lib/store';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/lib/features/products/productsApi';
import { ProductsToolbar } from '@/components/products/ProductsToolbar';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { DeleteProductModal } from '@/components/products/DeleteProductModal';
import { AdjustStockModal } from '@/components/inventory/AdjustStockModal';
import type { Category } from '@/types/product';
import styles from './page.module.css';

export default function ProductsPage() {
  const { searchQuery, selectedCategoryId } = useAppSelector((s) => s.products);

  const { data: products = [], isLoading, isError } = useGetProductsQuery({
    search: searchQuery || undefined,
    category_id: selectedCategoryId ?? undefined,
  });

  const { data: categories = [] } = useGetCategoriesQuery();

  // Build a quick lookup map: category id → name
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c: Category) => [c.id, c.name])),
    [categories]
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            {isLoading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <ProductsToolbar />

      {isError ? (
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>⚠️</span>
          <p>Failed to load products. Please check your connection and try again.</p>
        </div>
      ) : (
        <ProductsTable
          products={products}
          isLoading={isLoading}
          categoryMap={categoryMap}
        />
      )}

      {/* Modals */}
      <ProductFormModal />
      <DeleteProductModal />
      <AdjustStockModal />
    </div>
  );
}
