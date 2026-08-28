'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useGetSuppliersQuery } from '@/lib/features/suppliers/suppliersApi';

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>🏭</div>
      <h3 className={styles.emptyTitle}>No suppliers yet</h3>
      <p className={styles.emptySubtitle}>Add your first supplier to start tracking products, contacts, and operations.</p>
    </div>
  );
}

export default function SuppliersPage() {
  const { data: suppliers = [], isLoading, isError } = useGetSuppliersQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(suppliers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSuppliers = useMemo(
    () => suppliers.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize),
    [pageSize, safeCurrentPage, suppliers]
  );

  const summary = useMemo(() => {
    const totalProducts = suppliers.reduce((count, supplier) => count + supplier.supplied_products.length, 0);
    const totalAreas = new Set(suppliers.flatMap((supplier) => supplier.service_areas));

    return {
      suppliers: suppliers.length,
      suppliedProducts: totalProducts,
      serviceAreas: totalAreas.size,
    };
  }, [suppliers]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Suppliers</h1>
          <p className={styles.subtitle}>Track supplier contacts, supplied products, service areas, and operating details.</p>
        </div>
        <Link href="/dashboard/suppliers/new" className={styles.primaryButton}>
          Add supplier
        </Link>
      </div>

      <section className={styles.summaryGrid} aria-label="Supplier summary">
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Suppliers</span>
          <strong className={styles.summaryValue}>{isLoading ? 'Loading…' : summary.suppliers}</strong>
          <p className={styles.summaryNote}>Active supplier records.</p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Supplied products</span>
          <strong className={styles.summaryValue}>{isLoading ? 'Loading…' : summary.suppliedProducts}</strong>
          <p className={styles.summaryNote}>Products mapped to suppliers.</p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Service areas</span>
          <strong className={styles.summaryValue}>{isLoading ? 'Loading…' : summary.serviceAreas}</strong>
          <p className={styles.summaryNote}>Coverage points across suppliers.</p>
        </article>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h2 className={styles.tableTitle}>Suppliers</h2>
            <p className={styles.tableText}>Open any supplier to see contacts, operations, notes, and supplied products.</p>
          </div>
        </div>

        {isError ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Unable to load suppliers</h3>
            <p className={styles.emptySubtitle}>Please check your connection and try again.</p>
          </div>
        ) : isLoading ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Loading suppliers…</h3>
            <p className={styles.emptySubtitle}>Fetching the latest supplier records from the backend.</p>
          </div>
        ) : suppliers.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.supplierColumn}>Supplier</th>
                    <th>Contact</th>
                    <th className={styles.hideOnMobile}>Phone</th>
                    <th>Products</th>
                    <th className={styles.hideOnMobile}>Operations</th>
                    <th className={styles.actionsColumn}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSuppliers.map((supplier) => (
                    <tr key={supplier.id} className={styles.row}>
                      <td className={styles.supplierColumn}>
                        <div className={styles.supplierCell}>
                          <span className={styles.supplierName}>{supplier.name}</span>
                          <span className={styles.supplierMeta}>
                            {supplier.service_areas.length > 0 ? supplier.service_areas.join(', ') : 'Areas not set'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.contactCell}>
                          <span className={styles.contactName}>{supplier.contact_name || 'No contact added'}</span>
                          <span className={styles.contactMeta}>{supplier.email || 'No email added'}</span>
                        </div>
                      </td>
                      <td className={styles.hideOnMobile}>{supplier.phone || 'No phone added'}</td>
                      <td>
                        <span className={styles.countBadge}>{supplier.supplied_products.length} items</span>
                      </td>
                      <td className={styles.hideOnMobile}>
                        <div className={styles.operationsCell}>
                          <span>{supplier.operating_days || 'Days not set'}</span>
                          <span>{supplier.operating_hours || 'Hours not set'}</span>
                        </div>
                      </td>
                      <td className={styles.actionsCell}>
                        <Link href={`/dashboard/suppliers/${supplier.id}`} className={styles.viewLink}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <div className={styles.paginationSummary}>
                Showing {Math.min((safeCurrentPage - 1) * pageSize + 1, suppliers.length)}-{Math.min(safeCurrentPage * pageSize, suppliers.length)} of {suppliers.length}
              </div>

              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.paginationBtn}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage <= 1}
                >
                  Previous
                </button>

                <div className={styles.paginationPages} aria-label="Supplier pages">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`${styles.paginationPage} ${page === safeCurrentPage ? styles.paginationPageActive : ''}`}
                      onClick={() => setCurrentPage(page)}
                      aria-current={page === safeCurrentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className={styles.paginationBtn}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
