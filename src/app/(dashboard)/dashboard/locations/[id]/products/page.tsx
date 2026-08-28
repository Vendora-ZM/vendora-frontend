'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { DeleteProductModal } from '@/components/products/DeleteProductModal';
import { AdjustStockModal } from '@/components/inventory/AdjustStockModal';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetBalancesQuery } from '@/lib/features/inventory/inventoryApi';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/lib/features/products/productsApi';
import { Product } from '@/types/product';
import type { Category } from '@/types/product';
import type { Location } from '@/types/location';
import type { InventoryBalance } from '@/types/inventory';
import styles from './page.module.css';

const PAGE_SIZE = 8;

export default function LocationProductsPage() {
  const params = useParams<{ id?: string | string[] }>();
  const locationId = Array.isArray(params.id) ? params.id[0] : params.id ?? '';

  const { data: locations = [], isLoading: locationsLoading } = useGetLocationsQuery();
  const { data: balances = [], isLoading: balancesLoading } = useGetBalancesQuery(
    locationId ? { location_id: locationId } : undefined,
  );
  const { data: productsRaw = [], isLoading: productsLoading, isError } = useGetProductsQuery({});
  const { data: categories = [] } = useGetCategoriesQuery();

  const selectedLocation = useMemo(
    () => locations.find((location: Location) => location.id === locationId) ?? null,
    [locations, locationId]
  );
  const [currentPage, setCurrentPage] = useState(1);

  const stockedProductIds = useMemo(
    () => new Set(balances.map((balance: InventoryBalance) => balance.product_id)),
    [balances]
  );

  const locationProducts = useMemo(
    () => [...productsRaw].sort((a: Product, b: Product) => a.name.localeCompare(b.name)),
    [productsRaw]
  );

  const stockedProductCount = useMemo(
    () => locationProducts.filter((product: Product) => stockedProductIds.has(product.id)).length,
    [locationProducts, stockedProductIds]
  );

  const totalPages = Math.max(1, Math.ceil(locationProducts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return locationProducts.slice(start, start + PAGE_SIZE);
  }, [locationProducts, safeCurrentPage]);

  const startItem = locationProducts.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safeCurrentPage * PAGE_SIZE, locationProducts.length);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category: Category) => [category.id, category.name])),
    [categories]
  );

  const isLoading = locationsLoading || balancesLoading || productsLoading;

  if (!locationsLoading && !selectedLocation) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Location products</h1>
            <p className={styles.subtitle}>We could not find a location for this product view.</p>
          </div>
          <Link href="/dashboard/locations" className={styles.backLink}>
            Back to locations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumbs}>
            <Link href="/dashboard/locations">Locations</Link>
            <span>/</span>
            <Link href={`/dashboard/locations/${locationId}`}>{selectedLocation?.name ?? 'Location'}</Link>
            <span>/</span>
            <span>Products</span>
          </div>
          <h1 className={styles.title}>{selectedLocation?.name ?? 'Location'} Products</h1>
          <p className={styles.subtitle}>
            Products belong to the whole business and appear across every branch. Stock still stays location-specific,
            so add or adjust quantities for {selectedLocation?.name ?? 'this location'} when inventory arrives.
          </p>
        </div>

        <div className={styles.actions}>
          <span className={styles.locationBadge}>
            {isLoading
              ? 'Loading location…'
              : `${locationProducts.length} catalog item${locationProducts.length === 1 ? '' : 's'} · ${stockedProductCount} stocked here`}
          </span>
          <Link href={`/dashboard/locations/${locationId}`} className={styles.backLink}>
            Back to overview
          </Link>
        </div>
      </div>

      {isError ? (
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>⚠️</span>
          <p>Failed to load products for this location. Please try again.</p>
        </div>
      ) : (
        <>
          <ProductsTable
            products={pagedProducts}
            isLoading={isLoading}
            categoryMap={categoryMap}
            footer={
              !isLoading && locationProducts.length > 0 ? (
                <div className={styles.pagination}>
                  <div className={styles.paginationSummary}>
                    Showing {startItem} to {endItem} of {locationProducts.length}
                  </div>

                  <div className={styles.paginationControls}>
                    <button
                      type="button"
                      className={styles.pageButton}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={safeCurrentPage === 1}
                    >
                      Previous
                    </button>

                    <div className={styles.pageNumbers} aria-label="Location products pages">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page: number) => (
                        <button
                          key={page}
                          type="button"
                          className={`${styles.pageNumber} ${page === safeCurrentPage ? styles.pageNumberActive : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className={styles.pageButton}
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={safeCurrentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null
            }
          />
        </>
      )}

      <ProductFormModal />
      <DeleteProductModal />
      <AdjustStockModal />
    </div>
  );
}
