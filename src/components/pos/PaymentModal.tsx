'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { closePaymentModal, clearCart } from '@/lib/features/pos/posSlice';
import { useCreateSaleMutation, useCompleteSaleMutation } from '@/lib/features/sales/salesApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { PaymentMethod } from '@/types/sale';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './PaymentModal.module.css';

export const PaymentModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cart, discountAmount, isPaymentModalOpen } = useAppSelector((s) => s.pos);

  const [createSale] = useCreateSaleMutation();
  const [completeSale] = useCompleteSaleMutation();
  const { data: locations = [], isLoading: isLocationsLoading } = useGetLocationsQuery();

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + ((item.selling_price / 100) * item.cartQuantity), 0);
  const tax = cart.reduce((acc, item) => {
    if (item.is_taxable && item.tax_rate) {
      return acc + ((item.selling_price / 100) * item.cartQuantity * (parseFloat(item.tax_rate) / 100));
    }
    return acc;
  }, 0);
  const discount = parseFloat(discountAmount) || 0;
  const total = subtotal + tax - discount;

  const tendered = parseFloat(amountTendered) || 0;
  const change = Math.max(0, tendered - total);

  const handleProcessPayment = async () => {
    if (method === 'cash' && tendered < total) {
      setError('Amount tendered is less than the total.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create Sale (Draft)
      if (locations.length === 0) {
        setError('No locations found for this business. Please create a location first.');
        setIsProcessing(false);
        return;
      }
      const locationId = locations[0].id; // Use real location
      const sale = await createSale({
        location_id: locationId,
        discount_amount: Math.round(discount * 100),
        items: cart.map(item => {
          let taxAmount = 0;
          if (item.is_taxable && item.tax_rate) {
            taxAmount = (item.selling_price / 100) * (parseFloat(item.tax_rate) / 100);
          }
          return {
            product_id: item.id,
            quantity: item.cartQuantity.toString(),
            unit_price: item.selling_price,
            unit_cost: item.cost_price,
            tax_amount: Math.round(taxAmount * 100)
          };
        })
      }).unwrap();

      // 2. Complete Sale (Add Payment)
      await completeSale({
        id: sale.id,
        data: {
          payments: [{
            method,
            amount: Math.round(total * 100),
            reference: reference || undefined,
          }]
        }
      }).unwrap();

      dispatch(clearCart());
      dispatch(closePaymentModal());
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Pre-fill amount tendered when opening modal
  React.useEffect(() => {
    if (isPaymentModalOpen) {
      setAmountTendered(total.toFixed(2));
      setMethod('cash');
      setReference('');
      setError(null);
    }
  }, [isPaymentModalOpen, total]);

  return (
    <Modal
      isOpen={isPaymentModalOpen}
      onClose={() => !isProcessing && dispatch(closePaymentModal())}
      title="Complete Payment"
      size="md"
    >
      <div className={styles.content}>
        <div className={styles.totalDisplay}>
          <span className={styles.totalLabel}>Total Due</span>
          <span className={styles.totalValue}>K{total.toFixed(2)}</span>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <Select
          label="Payment Method"
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          disabled={isProcessing}
        >
          <option value="cash">Cash</option>
          <option value="card">Card (POS)</option>
          <option value="mobile_money">Mobile Money (Airtel/MTN)</option>
        </Select>

        {method === 'cash' ? (
          <>
            <Input
              label="Amount Tendered"
              type="number"
              step="0.01"
              value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)}
              disabled={isProcessing}
            />
            <div className={styles.changeDisplay}>
              <span>Change Due:</span>
              <span className={styles.changeAmount}>K{change.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <Input
            label="Transaction Reference (Optional)"
            placeholder="e.g. Receipt or Phone number"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            disabled={isProcessing}
          />
        )}

        <div className={styles.actions}>
          <Button variant="outline" size="lg" onClick={() => dispatch(closePaymentModal())} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={handleProcessPayment} disabled={isProcessing || isLocationsLoading}>
            {isProcessing ? 'Processing...' : isLocationsLoading ? 'Loading locations...' : 'Confirm Payment'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
