'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { closeDeleteModal } from '@/lib/features/products/productsSlice';
import { useDeleteProductMutation } from '@/lib/features/products/productsApi';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import styles from './DeleteProductModal.module.css';

export const DeleteProductModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDeleteModalOpen, selectedProduct } = useAppSelector((s) => s.products);
  const [deleteProduct, { isLoading, error }] = useDeleteProductMutation();

  const handleConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id).unwrap();
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
      title="Delete Product"
      size="sm"
    >
      <div className={styles.content}>
        <div className={styles.warningIcon}>⚠️</div>
        <p className={styles.message}>
          Are you sure you want to delete{' '}
          <strong className={styles.productName}>{selectedProduct?.name}</strong>?
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
            id="confirm-delete-btn"
            variant="primary"
            size="md"
            onClick={handleConfirm}
            disabled={isLoading}
            style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}
          >
            {isLoading ? 'Deleting…' : 'Delete Product'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
