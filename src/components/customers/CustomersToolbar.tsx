'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { setSearchQuery, openCreateModal } from '@/lib/features/customers/customersSlice';
import { Button } from '@/components/ui/Button';
import styles from './CustomersToolbar.module.css';

export const CustomersToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchQuery } = useAppSelector((s) => s.customers);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchQuery(localSearch));
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            id="customer-search"
            type="text"
            placeholder="Search customers by name, email or phone..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className={styles.searchInput}
          />
          {localSearch && (
            <button
              className={styles.clearBtn}
              onClick={() => { setLocalSearch(''); dispatch(setSearchQuery('')); }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={() => dispatch(openCreateModal())}
      >
        + Add Customer
      </Button>
    </div>
  );
};
