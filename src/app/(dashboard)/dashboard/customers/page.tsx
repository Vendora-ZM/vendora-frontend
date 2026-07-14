'use client';

import React from 'react';
import { useAppSelector } from '@/lib/store';
import { useGetCustomersQuery } from '@/lib/features/customers/customersApi';
import { CustomersToolbar } from '@/components/customers/CustomersToolbar';
import { CustomersTable } from '@/components/customers/CustomersTable';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';
import { DeleteCustomerModal } from '@/components/customers/DeleteCustomerModal';
import styles from './page.module.css';

export default function CustomersPage() {
  const { searchQuery } = useAppSelector((s) => s.customers);

  const { data: customers = [], isLoading, isError } = useGetCustomersQuery({
    search: searchQuery || undefined,
  });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>
            {isLoading ? 'Loading…' : `Manage your customer directory (${customers.length})`}
          </p>
        </div>
      </div>

      <CustomersToolbar />

      {isError ? (
        <div className={styles.errorState}>
          <p>Failed to load customers. Please check your connection and try again.</p>
        </div>
      ) : (
        <CustomersTable customers={customers} isLoading={isLoading} />
      )}

      <CustomerFormModal />
      <DeleteCustomerModal />
    </div>
  );
}
