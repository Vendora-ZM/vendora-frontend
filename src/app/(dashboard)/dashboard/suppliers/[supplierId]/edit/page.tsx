'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useGetSupplierByIdQuery, useUpdateSupplierMutation } from '@/lib/features/suppliers/suppliersApi';
import { Supplier } from '@/types/supplier';
import {
  createSupplierFormState,
  getApiErrorMessage,
  toUpdateSupplierPayload,
  type SupplierFormState,
} from '../../supplierData';

function EditSupplierForm({ supplier }: { supplier: Supplier }) {
  const router = useRouter();
  const [updateSupplier, { isLoading: isSaving }] = useUpdateSupplierMutation();
  const [form, setForm] = useState<SupplierFormState>(() => createSupplierFormState(supplier));
  const [formError, setFormError] = useState('');

  const handleChange = (field: keyof SupplierFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.contactName.trim() || !form.phone.trim()) {
      setFormError('Supplier name, primary contact, and phone are required.');
      return;
    }

    try {
      await updateSupplier({ id: supplier.id, data: toUpdateSupplierPayload(form, supplier) }).unwrap();
      router.push(`/dashboard/suppliers/${supplier.id}`);
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Failed to save supplier changes.'));
    }
  };

  return (
    <article className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Supplier profile</h2>
          <p className={styles.cardText}>Make changes here and save them back to the supplier profile.</p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {formError ? <p className={styles.cardText}>{formError}</p> : null}

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Supplier name *</span>
            <input value={form.name} onChange={(event) => handleChange('name', event.target.value)} placeholder="e.g. FreshRoute Distributors" disabled={isSaving} />
          </label>
          <label className={styles.field}>
            <span>Primary contact *</span>
            <input value={form.contactName} onChange={(event) => handleChange('contactName', event.target.value)} placeholder="e.g. Loveness Phiri" disabled={isSaving} />
          </label>
          <label className={styles.field}>
            <span>Phone *</span>
            <input value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} placeholder="e.g. +260 977 000 000" disabled={isSaving} />
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input value={form.email} onChange={(event) => handleChange('email', event.target.value)} placeholder="e.g. orders@supplier.com" disabled={isSaving} />
          </label>
        </div>

        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span>Supplied products</span>
          <input value={form.suppliedProducts} onChange={(event) => handleChange('suppliedProducts', event.target.value)} placeholder="Separate products with commas" disabled={isSaving} />
        </label>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Service areas</span>
            <input value={form.serviceAreas} onChange={(event) => handleChange('serviceAreas', event.target.value)} placeholder="e.g. Lusaka, Kafue" disabled={isSaving} />
          </label>
          <label className={styles.field}>
            <span>Payment terms</span>
            <input value={form.paymentTerms} onChange={(event) => handleChange('paymentTerms', event.target.value)} placeholder="e.g. Net 7 days" disabled={isSaving} />
          </label>
          <label className={styles.field}>
            <span>Operating days</span>
            <input value={form.operatingDays} onChange={(event) => handleChange('operatingDays', event.target.value)} placeholder="e.g. Mon - Sat" disabled={isSaving} />
          </label>
          <label className={styles.field}>
            <span>Operating hours</span>
            <input value={form.operatingHours} onChange={(event) => handleChange('operatingHours', event.target.value)} placeholder="e.g. 08:00 - 17:30" disabled={isSaving} />
          </label>
          <label className={styles.field}>
            <span>Lead time</span>
            <input value={form.leadTime} onChange={(event) => handleChange('leadTime', event.target.value)} placeholder="e.g. 24 hours" disabled={isSaving} />
          </label>
          <label className={styles.field}>
            <span>Address</span>
            <input value={form.address} onChange={(event) => handleChange('address', event.target.value)} placeholder="e.g. Plot 28, Makeni, Lusaka" disabled={isSaving} />
          </label>
        </div>

        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span>Notes</span>
          <textarea value={form.notes} onChange={(event) => handleChange('notes', event.target.value)} placeholder="Add delivery preferences, pricing notes, quality notes, or fallback plans" rows={5} disabled={isSaving} />
        </label>

        <div className={styles.formActions}>
          <Link href={`/dashboard/suppliers/${supplier.id}`} className={styles.secondaryButton}>Cancel</Link>
          <button type="submit" className={styles.primaryButton} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </article>
  );
}

export default function EditSupplierPage() {
  const params = useParams<{ supplierId: string }>();
  const supplierId = Array.isArray(params.supplierId) ? params.supplierId[0] : params.supplierId;
  const { data: supplier, isLoading: supplierLoading, isError } = useGetSupplierByIdQuery(supplierId, {
    skip: !supplierId,
  });

  if (supplierLoading) {
    return (
      <div className={styles.page}>
        <article className={styles.formCard}>
          <h1 className={styles.title}>Loading supplier…</h1>
          <p className={styles.subtitle}>Fetching the latest supplier profile from the backend.</p>
        </article>
      </div>
    );
  }

  if (isError || !supplier) {
    return (
      <div className={styles.page}>
        <article className={styles.formCard}>
          <h1 className={styles.title}>Supplier not found</h1>
          <p className={styles.subtitle}>This supplier record could not be loaded from the backend.</p>
          <div className={styles.formActions}>
            <Link href="/dashboard/suppliers" className={styles.secondaryButton}>Back to suppliers</Link>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Link href={`/dashboard/suppliers/${supplier.id}`} className={styles.backLink}>Back to profile</Link>
          <h1 className={styles.title}>Edit supplier</h1>
          <p className={styles.subtitle}>Update supplier contacts, supplied products, operating details, and notes.</p>
        </div>
      </div>

      <EditSupplierForm key={supplier.id} supplier={supplier} />
    </div>
  );
}
