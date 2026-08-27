'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { setSearchQuery, setSelectedCategory } from '@/lib/features/products/productsSlice';
import { useGetCategoriesQuery } from '@/lib/features/products/productsApi';
import { Button } from '@/components/ui/Button';
import type { Category } from '@/types/product';
import styles from './ProductsToolbar.module.css';

export const ProductsToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchQuery, selectedCategoryId } = useAppSelector((s) => s.products);
  const { data: categories = [] } = useGetCategoriesQuery();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchQuery(localSearch));
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch(setSelectedCategory(e.target.value || null));
    },
    [dispatch]
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            id="product-search"
            type="text"
            placeholder="Search products by name or item code…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className={styles.searchInput}
          />
          {localSearch && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => { setLocalSearch(''); dispatch(setSearchQuery('')); }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <select
          id="category-filter"
          value={selectedCategoryId ?? ''}
          onChange={handleCategoryChange}
          className={styles.categorySelect}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat: Category) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <Link href="/dashboard/products/new" passHref legacyBehavior>
        <Button
          id="add-product-btn"
          variant="primary"
          size="md"
          className={styles.addProductButton}
        >
          + Add Product
        </Button>
      </Link>
    </div>
  );
};
