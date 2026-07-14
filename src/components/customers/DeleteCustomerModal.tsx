'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { closeDeleteModal } from '@/lib/features/customers/customersSlice';
import { useDeleteCustomerMutation } from '@/lib/features/customers/customersApi';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import styles from './DeleteCustomerModal.module.css';

export const DeleteCustomerModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDeleteModalOpen, selectedCustomer } = useAppSelector((s) => s.customers);
  const [deleteCustomer, { isLoading, error }] = useDeleteCustomerMutation();

  const handleConfirm = async () => {
    if (!selectedCustomer) return;
    try {
      await deleteCustomer(selectedCustomer.id).unwrap();
      dispatch(closeDeleteModal());
    } catch {
      // Error is displayed via the `error` state below
    }
  };

  const apiError = (error as { data?: { message?: string } })?.data?.message;

  return (
    <Modal
      isOpen={isDeleteModalOpen}
      onClose={() => dispatch(closeDeleteModal())}
      title="Delete Customer"
      size="sm"
    >
      <div className={styles.content}>
        <div className={styles.warningIcon}>⚠️</div>
        <p className={styles.message}>
          Are you sure you want to delete{' '}
          <strong className={styles.customerName}>
            {selectedCustomer?.first_name} {selectedCustomer?.last_name}
          </strong>?
          <br />
          <span className={styles.warning}>This action cannot be undone.</span>
        </p>

        {apiError && <div className={styles.apiError}>{apiError}</div>}

        <div className={styles.actions}>
          <Button
            variant="outline"
            size="md"
            onClick={() => dispatch(closeDeleteModal())}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleConfirm}
            disabled={isLoading}
            style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}
          >
            {isLoading ? 'Deleting...' : 'Delete Customer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
