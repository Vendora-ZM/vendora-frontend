'use client';

import React, { useMemo, useState } from 'react';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/lib/features/products/productsApi';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { addToCart, removeFromCart } from '@/lib/features/pos/posSlice';
import { formatCurrencyFromCents } from '@/lib/utils/currency';
import { Product, type Category } from '@/types/product';
import styles from './ProductGrid.module.css';

export const ProductGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.pos.cart);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: me } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const currencyCode = business?.currency_code;

  const { data: products = [], isLoading } = useGetProductsQuery({
    search: search || undefined,
    category_id: selectedCategoryId ?? undefined,
  });

  const { data: categories = [] } = useGetCategoriesQuery();
  const selectedProductIds = useMemo(
    () => new Set(cart.map((item) => item.id)),
    [cart],
  );

  const handleProductClick = (product: Product) => {
    if (selectedProductIds.has(product.id)) {
      dispatch(removeFromCart(product.id));
      return;
    }

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
          {categories.map((cat: Category) => (
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
            {products.map((product: Product) => {
              const isSelected = selectedProductIds.has(product.id);

              return (
                <button
                  key={product.id}
                  className={`${styles.productCard} ${isSelected ? styles.productCardSelected : ''}`}
                  onClick={() => handleProductClick(product)}
                  disabled={!product.is_active}
                >
                  {isSelected ? (
                    <span className={styles.selectionBadge} aria-label={`${product.name} selected`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  ) : null}

                  <div className={styles.productInfo}>
                    <h4 className={styles.productName}>{product.name}</h4>
                    <span className={styles.productSku}>Item code (SKU): {product.sku}</span>
                  </div>
                  <div className={styles.productFooter}>
                    <div className={styles.productPrice}>
                      {formatCurrencyFromCents(product.selling_price, { currencyCode })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
