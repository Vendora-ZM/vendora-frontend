'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/store';
import {
  useGetCustomersQuery,
  useGetPaginatedCustomersQuery,
} from '@/lib/features/customers/customersApi';
import { CustomersToolbar } from '@/components/customers/CustomersToolbar';
import { CustomersTable } from '@/components/customers/CustomersTable';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';
import { DeleteCustomerModal } from '@/components/customers/DeleteCustomerModal';
import styles from './page.module.css';

export default function CustomersPage() {
  const { searchQuery } = useAppSelector((s) => s.customers);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: customers = [],
    isLoading: customersLoading,
    isError: customersError,
  } = useGetCustomersQuery({
    search: searchQuery || undefined,
  });

  const {
    data: paginatedCustomersResponse,
    isLoading: paginatedLoading,
    isError: paginatedError,
  } = useGetPaginatedCustomersQuery({
    search: searchQuery || undefined,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const paginatedCustomers = paginatedCustomersResponse?.data ?? [];
  const totalCustomers = customers.length;
  const totalPages = Math.max(1, paginatedCustomersResponse?.meta.total_pages ?? Math.ceil(totalCustomers / pageSize));
  const isLoading = customersLoading || paginatedLoading;
  const isError = customersError || paginatedError;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginationFooter = !isLoading && totalCustomers > 0 ? (
    <div className={styles.paginationFooter}>
      <div className={styles.paginationSummary}>
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalCustomers)}-
        {Math.min(currentPage * pageSize, totalCustomers)} of {totalCustomers}
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

        <div className={styles.paginationPages} aria-label="Customer pages">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={`${styles.paginationButton} ${page === currentPage ? styles.paginationButtonActive : ''}`}
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
  ) : null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>
            {isLoading ? 'Loading…' : `Manage your customer directory (${totalCustomers})`}
          </p>
        </div>
      </div>

      <CustomersToolbar />

      {isError ? (
        <div className={styles.errorState}>
          <p>Failed to load customers. Please check your connection and try again.</p>
        </div>
      ) : (
        <CustomersTable customers={paginatedCustomers} isLoading={isLoading} footer={paginationFooter} />
      )}

      <CustomerFormModal />
      <DeleteCustomerModal />
    </div>
  );
}
