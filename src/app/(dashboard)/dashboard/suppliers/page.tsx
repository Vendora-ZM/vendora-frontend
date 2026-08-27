'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { hydrateSuppliers, INITIAL_SUPPLIERS, type SupplierRecord } from './supplierData';

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
  const [suppliers] = useState<SupplierRecord[]>(() =>
    typeof window === 'undefined' ? INITIAL_SUPPLIERS : hydrateSuppliers()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(suppliers.length / pageSize));
  const paginatedSuppliers = useMemo(
    () => suppliers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, suppliers]
  );

  const summary = useMemo(() => {
    const totalProducts = suppliers.reduce((count, supplier) => count + supplier.suppliedProducts.length, 0);
    const totalAreas = new Set(suppliers.flatMap((supplier) => supplier.serviceAreas));

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
          <strong className={styles.summaryValue}>{summary.suppliers}</strong>
          <p className={styles.summaryNote}>Active supplier records.</p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Supplied products</span>
          <strong className={styles.summaryValue}>{summary.suppliedProducts}</strong>
          <p className={styles.summaryNote}>Products mapped to suppliers.</p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Service areas</span>
          <strong className={styles.summaryValue}>{summary.serviceAreas}</strong>
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

        {suppliers.length === 0 ? (
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
                            {supplier.serviceAreas.length > 0 ? supplier.serviceAreas.join(', ') : 'Areas not set'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.contactCell}>
                          <span className={styles.contactName}>{supplier.contactName}</span>
                          <span className={styles.contactMeta}>{supplier.email || 'No email added'}</span>
                        </div>
                      </td>
                      <td className={styles.hideOnMobile}>{supplier.phone || 'No phone added'}</td>
                      <td>
                        <span className={styles.countBadge}>{supplier.suppliedProducts.length} items</span>
                      </td>
                      <td className={styles.hideOnMobile}>
                        <div className={styles.operationsCell}>
                          <span>{supplier.operatingDays || 'Days not set'}</span>
                          <span>{supplier.operatingHours || 'Hours not set'}</span>
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
                Showing {Math.min((currentPage - 1) * pageSize + 1, suppliers.length)}-{Math.min(currentPage * pageSize, suppliers.length)} of {suppliers.length}
              </div>

              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.paginationBtn}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>

                <div className={styles.paginationPages} aria-label="Supplier pages">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`${styles.paginationPage} ${page === currentPage ? styles.paginationPageActive : ''}`}
                      onClick={() => setCurrentPage(page)}
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
                  disabled={currentPage >= totalPages}
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
