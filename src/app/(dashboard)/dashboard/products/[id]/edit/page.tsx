'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetProductByIdQuery } from '@/lib/features/products/productsApi';
import { ProductDetailsEditor } from '../ProductWorkspace';
import styles from '../page.module.css';

export default function EditProductPage() {
  const params = useParams<{ id?: string | string[] }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data: product, isLoading, isError } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  if (isLoading) {
    return <div className={styles.loadingState}>Loading product editor…</div>;
  }

  if (isError || !product) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <div className={styles.breadcrumbs}>
              <Link href="/dashboard/products">Products</Link>
              <span>/</span>
              <span>Edit product</span>
            </div>
            <h1 className={styles.title}>Edit product</h1>
            <p className={styles.subtitle}>
              We could not load this product. Please go back to the products page and try again.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Link className={styles.backLink} href="/dashboard/products">
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumbs}>
            <Link href="/dashboard/products">Products</Link>
            <span>/</span>
            <span>{product.name}</span>
            <span>/</span>
            <span>Edit</span>
          </div>
          <h1 className={styles.title}>Edit product</h1>
          <p className={styles.subtitle}>
            Update the product details on a dedicated page, while the products table stays focused on browsing and quick actions.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.actionRow}>
            <Link className={styles.backLink} href={`/dashboard/products/${product.id}`}>
              Open profile
            </Link>
            <Link className={styles.backLink} href="/dashboard/products">
              Back to products
            </Link>
          </div>
        </div>
      </div>

      <ProductDetailsEditor product={product} />
    </div>
  );
}
