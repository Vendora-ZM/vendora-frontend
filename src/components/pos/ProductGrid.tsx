'use client';

import React, { useState } from 'react';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/lib/features/products/productsApi';
import { useAppDispatch } from '@/lib/store';
import { addToCart } from '@/lib/features/pos/posSlice';
import { Product } from '@/types/product';
import styles from './ProductGrid.module.css';

export const ProductGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: products = [], isLoading } = useGetProductsQuery({
    search: search || undefined,
    category_id: selectedCategoryId ?? undefined,
  });

  const { data: categories = [] } = useGetCategoriesQuery();

  const handleProductClick = (product: Product) => {
    dispatch(addToCart(product));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className={styles.categories}>
          <button
            className={`${styles.categoryChip} ${!selectedCategoryId ? styles.activeChip : ''}`}
            onClick={() => setSelectedCategoryId(null)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryChip} ${selectedCategoryId === cat.id ? styles.activeChip : ''}`}
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.gridWrapper}>
        {isLoading ? (
          <div className={styles.loadingState}>Loading products...</div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>No products found.</div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <button
                key={product.id}
                className={styles.productCard}
                onClick={() => handleProductClick(product)}
                disabled={!product.is_active}
              >
                <div className={styles.productInfo}>
                  <h4 className={styles.productName}>{product.name}</h4>
                  <span className={styles.productSku}>{product.sku}</span>
                </div>
                <div className={styles.productPrice}>
                  K{(product.selling_price / 100).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
