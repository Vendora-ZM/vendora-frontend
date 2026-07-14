'use client';

import React from 'react';
import { Customer } from '@/types/customer';
import { useAppDispatch } from '@/lib/store';
import { openEditModal, openDeleteModal } from '@/lib/features/customers/customersSlice';
import styles from './CustomersTable.module.css';

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
}

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i}><div className={styles.skeleton} /></td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={5}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <h3 className={styles.emptyTitle}>No customers found</h3>
          <p className={styles.emptySubtitle}>
            Add your first customer to start tracking their purchases.
          </p>
        </div>
      </td>
    </tr>
  );
}

export const CustomersTable: React.FC<CustomersTableProps> = ({ customers, isLoading }) => {
  const dispatch = useAppDispatch();

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact Info</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : customers.length === 0
            ? <EmptyState />
            : customers.map((customer) => (
                <tr key={customer.id} className={styles.row}>
                  <td>
                    <div className={styles.customerCell}>
                      <span className={styles.customerName}>
                        {customer.first_name} {customer.last_name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      {customer.email && <span className={styles.email}>{customer.email}</span>}
                      {customer.phone && <span className={styles.phone}>{customer.phone}</span>}
                      {!customer.email && !customer.phone && <span className={styles.noData}>No contact info</span>}
                    </div>
                  </td>
                  <td className={styles.locationCell}>
                    {customer.city ? `${customer.city}, ${customer.country_code}` : customer.country_code}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${customer.is_active ? styles.active : styles.inactive}`}>
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        title="Edit customer"
                        onClick={() => dispatch(openEditModal(customer))}
                      >
                        ✏️
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Delete customer"
                        onClick={() => dispatch(openDeleteModal(customer))}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
};
