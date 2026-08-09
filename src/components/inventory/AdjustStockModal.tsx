'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { closeAdjustModal } from '@/lib/features/inventory/inventorySlice';
import { useAdjustStockMutation } from '@/lib/features/inventory/inventoryApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetProductsQuery } from '@/lib/features/products/productsApi';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const AdjustStockModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAdjustModalOpen, selectedProductId } = useAppSelector((state) => state.inventory);
  
  const [adjustStock] = useAdjustStockMutation();
  const { data: locations = [] } = useGetLocationsQuery();
  const { data: products = [] } = useGetProductsQuery({});

  const [locationId, setLocationId] = useState<string>('');
  const [quantityDelta, setQuantityDelta] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = products.find(p => p.id === selectedProductId);

  useEffect(() => {
    if (isAdjustModalOpen) {
      setLocationId(locations[0]?.id || '');
      setQuantityDelta('');
      setNotes('');
      setError(null);
    }
  }, [isAdjustModalOpen, locations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    if (!locationId) {
      setError('Please select a location');
      return;
    }
    if (!quantityDelta || isNaN(parseFloat(quantityDelta))) {
      setError('Please enter a valid quantity');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await adjustStock({
        product_id: selectedProductId,
        location_id: locationId,
        quantity_delta: quantityDelta,
        notes: notes || undefined,
      }).unwrap();
      dispatch(closeAdjustModal());
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to adjust stock. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAdjustModalOpen}
      onClose={() => !isSubmitting && dispatch(closeAdjustModal())}
      title="Adjust Stock"
      size="sm"
    >
      <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-dark-grey)' }}>
          Adjusting inventory for <strong>{product?.name}</strong> (Item code: {product?.sku})
        </p>

        {error && (
          <div style={{ padding: '12px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <Select
          label="Location"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          disabled={isSubmitting}
          required
        >
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </Select>

        <Input
          label="Quantity to Add/Remove"
          type="number"
          step="1"
          placeholder="e.g. 50 or -10"
          value={quantityDelta}
          onChange={(e) => setQuantityDelta(e.target.value)}
          disabled={isSubmitting}
          required
          helpText="Use a positive number to add stock, or a negative number to remove stock."
        />

        <Input
          label="Notes (Optional)"
          placeholder="Reason for adjustment"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
        />

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button type="button" variant="outline" onClick={() => dispatch(closeAdjustModal())} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Adjust Stock'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
