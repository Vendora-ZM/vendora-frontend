'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { closeTransferModal } from '@/lib/features/inventory/inventorySlice';
import { useTransferStockMutation } from '@/lib/features/inventory/inventoryApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetProductsQuery } from '@/lib/features/products/productsApi';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const TransferStockModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isTransferModalOpen, selectedProductId } = useAppSelector((state) => state.inventory);
  
  const [transferStock] = useTransferStockMutation();
  const { data: locations = [] } = useGetLocationsQuery();
  const { data: products = [] } = useGetProductsQuery({});

  const [fromLocationId, setFromLocationId] = useState<string>('');
  const [toLocationId, setToLocationId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = products.find(p => p.id === selectedProductId);

  useEffect(() => {
    if (isTransferModalOpen) {
      setFromLocationId(locations[0]?.id || '');
      setToLocationId(locations.length > 1 ? locations[1].id : '');
      setQuantity('');
      setNotes('');
      setError(null);
    }
  }, [isTransferModalOpen, locations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    if (!fromLocationId || !toLocationId) {
      setError('Please select both source and destination locations');
      return;
    }
    if (fromLocationId === toLocationId) {
      setError('Source and destination locations must be different');
      return;
    }
    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      setError('Please enter a valid positive quantity');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await transferStock({
        product_id: selectedProductId,
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
        quantity: quantity,
        notes: notes || undefined,
      }).unwrap();
      dispatch(closeTransferModal());
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to transfer stock. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isTransferModalOpen}
      onClose={() => !isSubmitting && dispatch(closeTransferModal())}
      title="Transfer Stock"
      size="sm"
    >
      <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-dark-grey)' }}>
          Transferring inventory for <strong>{product?.name}</strong> (Item code: {product?.sku})
        </p>

        {error && (
          <div style={{ padding: '12px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <Select
          label="From Location"
          value={fromLocationId}
          onChange={(e) => setFromLocationId(e.target.value)}
          disabled={isSubmitting}
          required
        >
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </Select>

        <Select
          label="To Location"
          value={toLocationId}
          onChange={(e) => setToLocationId(e.target.value)}
          disabled={isSubmitting}
          required
        >
          <option value="" disabled>Select destination...</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </Select>

        <Input
          label="Quantity to Transfer"
          type="number"
          step="1"
          min="1"
          placeholder="e.g. 50"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={isSubmitting}
          required
        />

        <Input
          label="Notes (Optional)"
          placeholder="Reason for transfer"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
        />

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button type="button" variant="outline" onClick={() => dispatch(closeTransferModal())} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Transferring...' : 'Transfer Stock'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
