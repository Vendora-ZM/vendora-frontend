'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { closeAdjustModal } from '@/lib/features/inventory/inventorySlice';
import { useAdjustStockMutation } from '@/lib/features/inventory/inventoryApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetProductsQuery } from '@/lib/features/products/productsApi';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types/product';

function AdjustStockModalBody({
  selectedProductId,
  product,
  locations,
  onClose,
}: {
  selectedProductId: string;
  product?: Product;
  locations: Array<{ id: string; name: string }>;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [adjustStock] = useAdjustStockMutation();
  const [locationId, setLocationId] = useState<string>('');
  const [quantityDelta, setQuantityDelta] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedLocationId = locationId || locations[0]?.id || '';
  const parsedDelta = Number(quantityDelta);
  const isAddingStock = quantityDelta !== '' && !Number.isNaN(parsedDelta) && parsedDelta > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocationId) {
      setError('Please select a location');
      return;
    }
    if (!quantityDelta || Number.isNaN(parseFloat(quantityDelta))) {
      setError('Please enter a valid quantity');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await adjustStock({
        product_id: selectedProductId,
        location_id: selectedLocationId,
        quantity_delta: quantityDelta,
        notes: notes || undefined,
        expiry_date: isAddingStock && expiryDate ? expiryDate : undefined,
      }).unwrap();
      dispatch(closeAdjustModal());
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message;
      setError(message || 'Failed to adjust stock. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-dark-grey)' }}>
        Adjusting inventory for <strong>{product?.name}</strong> (Item code: {product?.sku})
      </p>

      {error ? (
        <div style={{ padding: '12px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '6px', fontSize: '0.875rem' }}>
          {error}
        </div>
      ) : null}

      <Select
        label="Location"
        value={selectedLocationId}
        onChange={(e) => setLocationId(e.target.value)}
        disabled={isSubmitting}
        required
      >
        {locations.map((loc) => (
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

      {isAddingStock ? (
        <Input
          label="Expiry Date (Optional)"
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          disabled={isSubmitting}
          helpText="Set this when the stock being added expires on a specific date."
        />
      ) : null}

      <Input
        label="Notes (Optional)"
        placeholder="Reason for adjustment"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={isSubmitting}
      />

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Adjust Stock'}
        </Button>
      </div>
    </form>
  );
}

export const AdjustStockModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAdjustModalOpen, selectedProductId } = useAppSelector((state) => state.inventory);
  const { data: locations = [] } = useGetLocationsQuery();
  const { data: products = [] } = useGetProductsQuery({});
  const product = products.find((p: Product) => p.id === selectedProductId);
  const handleClose = () => dispatch(closeAdjustModal());

  return (
    <Modal
      isOpen={isAdjustModalOpen}
      onClose={handleClose}
      title="Adjust Stock"
      size="sm"
    >
      {isAdjustModalOpen && selectedProductId ? (
        <AdjustStockModalBody
          key={selectedProductId}
          selectedProductId={selectedProductId}
          product={product}
          locations={locations}
          onClose={handleClose}
        />
      ) : null}
    </Modal>
  );
};
