'use client';

import React, { useState } from 'react';
import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useGetPaginatedCategoriesQuery,
} from '@/lib/features/products/productsApi';
import { CreateCategoryPayload, type Category } from '@/types/product';
import styles from './page.module.css';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CategoriesPage() {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch,
  } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [currentPage, setCurrentPage] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const pageSize = 8;

  const {
    data: paginatedCategoriesResponse,
    isLoading: paginatedLoading,
    isError: paginatedError,
    refetch: refetchPaginatedCategories,
  } = useGetPaginatedCategoriesQuery({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const paginatedCategories = paginatedCategoriesResponse?.data ?? [];
  const totalCategories = categories.length;
  const totalPages = Math.max(1, paginatedCategoriesResponse?.meta.total_pages ?? Math.ceil(totalCategories / pageSize));
  const isLoading = categoriesLoading || paginatedLoading;
  const isError = categoriesError || paginatedError;
  const activeCount = categories.filter((category: Category) => category.is_active).length;

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
      setCurrentPage(1);
      void refetch();
      void refetchPaginatedCategories();
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
              <h2>Category list</h2>
              <p>{isLoading ? 'Loading categories…' : `${totalCategories} categories total`}</p>
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
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      No categories yet. Add your first one using the form.
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category: Category) => (
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

          {!isLoading && !isError && totalCategories > 0 ? (
            <div className={styles.paginationFooter}>
              <div className={styles.paginationSummary}>
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalCategories)}-
                {Math.min(currentPage * pageSize, totalCategories)} of {totalCategories}
              </div>

              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>

                <div className={styles.paginationPages} aria-label="Category pages">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`${styles.paginationButton} ${
                        page === currentPage ? styles.paginationButtonActive : ''
                      }`}
                      onClick={() => setCurrentPage(page)}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Create category</h2>
              <p>Add a new category for your product catalog.</p>
            </div>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                void refetch();
                void refetchPaginatedCategories();
              }}
              disabled={isLoading}
            >
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
      </div>
    </div>
  );
}
