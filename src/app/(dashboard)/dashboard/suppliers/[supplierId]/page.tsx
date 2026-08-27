'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { hydrateSuppliers, INITIAL_SUPPLIERS, type SupplierRecord } from '../supplierData';

export default function SupplierDetailsPage() {
  const params = useParams<{ supplierId: string }>();
  const [suppliers] = useState<SupplierRecord[]>(() =>
    typeof window === 'undefined' ? INITIAL_SUPPLIERS : hydrateSuppliers()
  );

  const supplier = useMemo(
    () => suppliers.find((entry) => entry.id === params.supplierId) ?? null,
    [params.supplierId, suppliers]
  );

  if (!supplier) {
    return (
      <div className={styles.page}>
        <article className={styles.emptyCard}>
          <h1 className={styles.title}>Supplier not found</h1>
          <p className={styles.subtitle}>This supplier record could not be found in the current workspace.</p>
          <Link href="/dashboard/suppliers" className={styles.primaryButton}>Back to suppliers</Link>
        </article>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Link href="/dashboard/suppliers" className={styles.backLink}>Back to suppliers</Link>
          <h1 className={styles.title}>{supplier.name}</h1>
          <p className={styles.subtitle}>Supplier profile with contact details, operations, supplied products, and notes.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/dashboard/suppliers/${supplier.id}/edit`} className={styles.secondaryButton}>Edit supplier</Link>
          <Link href="/dashboard/suppliers/new" className={styles.primaryButton}>Add supplier</Link>
        </div>
      </div>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Contact</span>
          <strong className={styles.summaryValue}>{supplier.contactName}</strong>
          <p className={styles.summaryNote}>{supplier.phone || 'No phone added'}</p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Products</span>
          <strong className={styles.summaryValue}>{supplier.suppliedProducts.length}</strong>
          <p className={styles.summaryNote}>Supplied product lines</p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Lead time</span>
          <strong className={styles.summaryValue}>{supplier.leadTime || 'N/A'}</strong>
          <p className={styles.summaryNote}>{supplier.paymentTerms || 'Terms not set'}</p>
        </article>
      </section>

      <section className={styles.detailGrid}>
        <article className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Contact details</h2>
          <div className={styles.infoList}>
            <div><span>Email</span><p>{supplier.email || 'No email added'}</p></div>
            <div><span>Phone</span><p>{supplier.phone || 'No phone added'}</p></div>
            <div><span>Address</span><p>{supplier.address || 'No address added'}</p></div>
          </div>
        </article>

        <article className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Operations</h2>
          <div className={styles.infoList}>
            <div><span>Operating days</span><p>{supplier.operatingDays || 'Not set'}</p></div>
            <div><span>Operating hours</span><p>{supplier.operatingHours || 'Not set'}</p></div>
            <div><span>Payment terms</span><p>{supplier.paymentTerms || 'Not set'}</p></div>
          </div>
        </article>
      </section>

      <section className={styles.detailGrid}>
        <article className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Supplied products</h2>
          <div className={styles.tagList}>
            {supplier.suppliedProducts.length > 0 ? supplier.suppliedProducts.map((product) => (
              <span key={product} className={styles.tag}>{product}</span>
            )) : <span className={styles.emptyTag}>No products linked yet</span>}
          </div>
        </article>

        <article className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Service areas</h2>
          <div className={styles.tagList}>
            {supplier.serviceAreas.length > 0 ? supplier.serviceAreas.map((area) => (
              <span key={area} className={styles.tagMuted}>{area}</span>
            )) : <span className={styles.emptyTag}>No service areas added</span>}
          </div>
        </article>
      </section>

      <article className={styles.notesCard}>
        <h2 className={styles.cardTitle}>Notes</h2>
        <p className={styles.notes}>{supplier.notes || 'No notes added for this supplier yet.'}</p>
      </article>
    </div>
  );
}
