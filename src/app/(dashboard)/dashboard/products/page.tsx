'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/lib/store';
import {
  useGetPaginatedProductsQuery,
  useGetCategoriesQuery,
} from '@/lib/features/products/productsApi';
import { ProductsToolbar } from '@/components/products/ProductsToolbar';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { DeleteProductModal } from '@/components/products/DeleteProductModal';
import { AdjustStockModal } from '@/components/inventory/AdjustStockModal';
import type { Category } from '@/types/product';
import styles from './page.module.css';

export default function ProductsPage() {
  const { searchQuery, selectedCategoryId } = useAppSelector((s) => s.products);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: productsResponse,
    isLoading,
    isError,
  } = useGetPaginatedProductsQuery({
    search: searchQuery || undefined,
    category_id: selectedCategoryId ?? undefined,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const { data: categories = [] } = useGetCategoriesQuery();
  const products = productsResponse?.data ?? [];
  const totalProducts = productsResponse?.meta.total ?? 0;
  const totalPages = Math.max(1, productsResponse?.meta.total_pages ?? Math.ceil(totalProducts / pageSize));

  // Build a quick lookup map: category id → name
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c: Category) => [c.id, c.name])),
    [categories]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryId]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginationFooter = totalProducts > 0 ? (
    <div className={styles.pagination}>
      <div className={styles.paginationSummary}>
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalProducts)}-{Math.min(currentPage * pageSize, totalProducts)} of {totalProducts}
      </div>

      <div className={styles.paginationControls}>
        <button
          type="button"
          className={styles.paginationBtn}
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </button>

        <div className={styles.paginationPages} aria-label="Product pages">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={`${styles.paginationPage} ${page === currentPage ? styles.paginationPageActive : ''}`}
              onClick={() => setCurrentPage(page)}
              disabled={isLoading}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.paginationBtn}
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={currentPage >= totalPages || isLoading}
        >
          Next
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            {isLoading ? 'Loading…' : `${totalProducts} product${totalProducts !== 1 ? 's' : ''}`}
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
          footer={paginationFooter}
        />
      )}

      {/* Modals */}
      <ProductFormModal />
      <DeleteProductModal />
      <AdjustStockModal />
    </div>
  );
}
