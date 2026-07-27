'use client';

import React, { useMemo, useState } from 'react';
import { useCreateCategoryMutation, useGetCategoriesQuery } from '@/lib/features/products/productsApi';
import { CreateCategoryPayload } from '@/types/product';
import styles from './page.module.css';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading, isError, refetch } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
    [categories]
  );

  const activeCount = useMemo(
    () => categories.filter((category) => category.is_active).length,
    [categories]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    const payload: CreateCategoryPayload = {
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
    };

    if (!payload.name) {
      setFormError('Category name is required.');
      return;
    }

    try {
      await createCategory(payload).unwrap();
      setName('');
      setDescription('');
      setFormSuccess('Category created successfully.');
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'data' in error
          ? ((error as { data?: { message?: string; error?: string } }).data?.message ||
              (error as { data?: { message?: string; error?: string } }).data?.error)
          : null;
      setFormError(message || 'Failed to create category.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>
            Create and manage product categories so your catalog stays organized across the business.
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total</span>
            <strong className={styles.statValue}>{categories.length}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Active</span>
            <strong className={styles.statValue}>{activeCount}</strong>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Create category</h2>
              <p>Add a new category for your product catalog.</p>
            </div>
            <button type="button" className={styles.linkButton} onClick={() => refetch()} disabled={isLoading}>
              Refresh
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>Category name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Beverages"
                className={styles.input}
                maxLength={120}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional category notes…"
                className={styles.textarea}
                rows={4}
                maxLength={500}
              />
            </label>

            {formError ? <div className={styles.errorBanner}>{formError}</div> : null}
            {formSuccess ? <div className={styles.successBanner}>{formSuccess}</div> : null}

            <button type="submit" className={styles.submitButton} disabled={isCreating}>
              {isCreating ? 'Saving…' : 'Add category'}
            </button>
          </form>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Category list</h2>
              <p>{isLoading ? 'Loading categories…' : `${categories.length} categories total`}</p>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {isError ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      Failed to load categories. Please try again.
                    </td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      Loading categories…
                    </td>
                  </tr>
                ) : sortedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      No categories yet. Add your first one using the form.
                    </td>
                  </tr>
                ) : (
                  sortedCategories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <div className={styles.nameCell}>
                          <strong>{category.name}</strong>
                          <span>{category.id}</span>
                        </div>
                      </td>
                      <td>{category.description || 'No description'}</td>
                      <td>
                        <span className={`${styles.statusPill} ${category.is_active ? styles.active : styles.inactive}`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{formatDate(category.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
