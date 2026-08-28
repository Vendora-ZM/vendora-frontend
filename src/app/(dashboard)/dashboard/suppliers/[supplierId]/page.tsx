'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { useGetSupplierByIdQuery } from '@/lib/features/suppliers/suppliersApi';
import { formatSupplierAddress } from '../supplierData';

export default function SupplierDetailsPage() {
  const params = useParams<{ supplierId: string }>();
  const supplierId = Array.isArray(params.supplierId) ? params.supplierId[0] : params.supplierId;
  const { data: supplier, isLoading, isError } = useGetSupplierByIdQuery(supplierId, {
    skip: !supplierId,
  });

  if (isLoading) {
    return (
      <div className={styles.page}>
        <article className={styles.emptyCard}>
          <h1 className={styles.title}>Loading supplier…</h1>
          <p className={styles.subtitle}>Fetching the latest supplier profile from the backend.</p>
        </article>
      </div>
    );
  }

  if (isError || !supplier) {
    return (
      <div className={styles.page}>
        <article className={styles.emptyCard}>
          <h1 className={styles.title}>Supplier not found</h1>
          <p className={styles.subtitle}>This supplier record could not be loaded from the backend.</p>
          <Link href="/dashboard/suppliers" className={styles.primaryButton}>Back to suppliers</Link>
        </article>
      </div>
    );
  }

  const address = formatSupplierAddress(supplier);
  const suppliedProducts = supplier.supplied_products ?? [];
  const serviceAreas = supplier.service_areas ?? [];

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
          <strong className={styles.summaryValue}>{supplier.contact_name || 'No contact added'}</strong>
          <p className={styles.summaryNote}>{supplier.phone || 'No phone added'}</p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Products</span>
          <strong className={styles.summaryValue}>{suppliedProducts.length}</strong>
          <p className={styles.summaryNote}>Supplied product lines</p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Lead time</span>
          <strong className={styles.summaryValue}>{supplier.lead_time || 'N/A'}</strong>
          <p className={styles.summaryNote}>{supplier.payment_terms || 'Terms not set'}</p>
        </article>
      </section>

      <section className={styles.detailGrid}>
        <article className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Contact details</h2>
          <div className={styles.infoList}>
            <div><span>Email</span><p>{supplier.email || 'No email added'}</p></div>
            <div><span>Phone</span><p>{supplier.phone || 'No phone added'}</p></div>
            <div><span>Address</span><p>{address || 'No address added'}</p></div>
          </div>
        </article>

        <article className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Operations</h2>
          <div className={styles.infoList}>
            <div><span>Operating days</span><p>{supplier.operating_days || 'Not set'}</p></div>
            <div><span>Operating hours</span><p>{supplier.operating_hours || 'Not set'}</p></div>
            <div><span>Payment terms</span><p>{supplier.payment_terms || 'Not set'}</p></div>
          </div>
        </article>
      </section>

      <section className={styles.detailGrid}>
        <article className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Supplied products</h2>
          <div className={styles.tagList}>
            {suppliedProducts.length > 0 ? suppliedProducts.map((product) => (
              <span key={product} className={styles.tag}>{product}</span>
            )) : <span className={styles.emptyTag}>No products linked yet</span>}
          </div>
        </article>

        <article className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Service areas</h2>
          <div className={styles.tagList}>
            {serviceAreas.length > 0 ? serviceAreas.map((area) => (
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
