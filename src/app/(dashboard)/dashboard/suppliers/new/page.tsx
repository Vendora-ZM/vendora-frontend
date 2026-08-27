'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { createSupplierRecord, hydrateSuppliers, INITIAL_FORM, type SupplierFormState, writeSuppliers } from '../supplierData';

export default function NewSupplierPage() {
  const router = useRouter();
  const [form, setForm] = useState<SupplierFormState>(INITIAL_FORM);

  const handleChange = (field: keyof SupplierFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.contactName.trim() || !form.phone.trim()) {
      return;
    }

    const newSupplier = createSupplierRecord(form);
    const suppliers = hydrateSuppliers();
    writeSuppliers([newSupplier, ...suppliers]);
    router.push(`/dashboard/suppliers/${newSupplier.id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Link href="/dashboard/suppliers" className={styles.backLink}>Back to suppliers</Link>
          <h1 className={styles.title}>Add supplier</h1>
          <p className={styles.subtitle}>Save supplier contacts, supplied products, operating details, and notes.</p>
        </div>
      </div>

      <article className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Supplier profile</h2>
            <p className={styles.cardText}>Capture the details your team needs before they reorder from this supplier.</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Supplier name *</span>
              <input value={form.name} onChange={(event) => handleChange('name', event.target.value)} placeholder="e.g. FreshRoute Distributors" />
            </label>
            <label className={styles.field}>
              <span>Primary contact *</span>
              <input value={form.contactName} onChange={(event) => handleChange('contactName', event.target.value)} placeholder="e.g. Loveness Phiri" />
            </label>
            <label className={styles.field}>
              <span>Phone *</span>
              <input value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} placeholder="e.g. +260 977 000 000" />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input value={form.email} onChange={(event) => handleChange('email', event.target.value)} placeholder="e.g. orders@supplier.com" />
            </label>
          </div>

          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span>Supplied products</span>
            <input value={form.suppliedProducts} onChange={(event) => handleChange('suppliedProducts', event.target.value)} placeholder="Separate products with commas" />
          </label>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Service areas</span>
              <input value={form.serviceAreas} onChange={(event) => handleChange('serviceAreas', event.target.value)} placeholder="e.g. Lusaka, Kafue" />
            </label>
            <label className={styles.field}>
              <span>Payment terms</span>
              <input value={form.paymentTerms} onChange={(event) => handleChange('paymentTerms', event.target.value)} placeholder="e.g. Net 7 days" />
            </label>
            <label className={styles.field}>
              <span>Operating days</span>
              <input value={form.operatingDays} onChange={(event) => handleChange('operatingDays', event.target.value)} placeholder="e.g. Mon - Sat" />
            </label>
            <label className={styles.field}>
              <span>Operating hours</span>
              <input value={form.operatingHours} onChange={(event) => handleChange('operatingHours', event.target.value)} placeholder="e.g. 08:00 - 17:30" />
            </label>
            <label className={styles.field}>
              <span>Lead time</span>
              <input value={form.leadTime} onChange={(event) => handleChange('leadTime', event.target.value)} placeholder="e.g. 24 hours" />
            </label>
            <label className={styles.field}>
              <span>Address</span>
              <input value={form.address} onChange={(event) => handleChange('address', event.target.value)} placeholder="e.g. Plot 28, Makeni, Lusaka" />
            </label>
          </div>

          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span>Notes</span>
            <textarea value={form.notes} onChange={(event) => handleChange('notes', event.target.value)} placeholder="Add delivery preferences, pricing notes, quality notes, or fallback plans" rows={5} />
          </label>

          <div className={styles.formActions}>
            <Link href="/dashboard/suppliers" className={styles.secondaryButton}>Cancel</Link>
            <button type="submit" className={styles.primaryButton}>Save supplier</button>
          </div>
        </form>
      </article>
    </div>
  );
}
