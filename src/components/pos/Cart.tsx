'use client';

import React, { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { clearCart, removeFromCart, updateQuantity } from '@/lib/features/pos/posSlice';
import { useCreateSaleMutation, useCompleteSaleMutation } from '@/lib/features/sales/salesApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { PaymentMethod, Sale } from '@/types/sale';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { buildPaymentTypeOptions, getPaymentTypeLabel } from '@/lib/business/paymentTypes';
import styles from './Cart.module.css';

type CheckoutStage = 2 | 3 | 4;

type SaleSummary = {
  saleNumber: string;
  total: number;
  change: number;
  paymentMethod: PaymentMethod;
  paymentTypeLabel: string;
  completedAt: string;
};

interface CartProps {
  initialStage?: CheckoutStage;
  paymentTypes?: string[];
  salesChannelLabel?: string;
  onBackToSelection?: () => void;
  onStartNewSale?: () => void;
}

function formatAmount(amount: number) {
  return `K${amount.toFixed(2)}`;
}

export const Cart: React.FC<CartProps> = ({
  initialStage = 2,
  paymentTypes,
  salesChannelLabel,
  onBackToSelection,
  onStartNewSale,
}) => {
  const dispatch = useAppDispatch();
  const { cart, discountAmount } = useAppSelector((s) => s.pos);

  const [stage, setStage] = useState<CheckoutStage>(initialStage);
  const paymentTypeOptions = useMemo(() => buildPaymentTypeOptions(paymentTypes), [paymentTypes]);
  const [paymentTypeLabel, setPaymentTypeLabel] = useState(paymentTypeOptions[0]?.label ?? '');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completion, setCompletion] = useState<SaleSummary | null>(null);

  const [createSale] = useCreateSaleMutation();
  const [completeSale] = useCompleteSaleMutation();
  const { data: locations = [], isLoading: isLocationsLoading } = useGetLocationsQuery();

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
  const activePaymentTypeLabel =
    paymentTypeOptions.some((option) => option.label === paymentTypeLabel)
      ? paymentTypeLabel
      : paymentTypeOptions[0]?.label ?? '';
  const activePaymentType =
    paymentTypeOptions.find((option) => option.label === activePaymentTypeLabel) ?? paymentTypeOptions[0];
  const method: PaymentMethod = activePaymentType?.method ?? 'cash';
  const methodLabel = activePaymentType?.label ?? getPaymentTypeLabel(method, paymentTypes);

  const locationName = useMemo(() => locations[0]?.name ?? 'Primary location', [locations]);

  const handleGoToPayment = () => {
    if (cart.length === 0) return;
    setStage(3);
    setError(null);
    if (method === 'cash') {
      setAmountTendered(total.toFixed(2));
    }
  };

  const handleStartNewSale = () => {
    dispatch(clearCart());
    setCompletion(null);
    setStage(2);
    setPaymentTypeLabel(paymentTypeOptions[0]?.label ?? '');
    setAmountTendered('');
    setReference('');
    setError(null);
    onStartNewSale?.();
  };

  const handleConfirmPayment = async () => {
    if (cart.length === 0) return;

    if (!locations.length) {
      setError('No locations found for this business. Please create a location first.');
      return;
    }

    if (method === 'cash' && tendered < total) {
      setError('Amount tendered is less than the total.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const locationId = locations[0].id;
      const sale = await createSale({
        location_id: locationId,
        discount_amount: Math.round(discount * 100),
        notes: salesChannelLabel ? `Sales channel: ${salesChannelLabel}` : undefined,
        items: cart.map((item) => {
          let taxAmount = 0;
          if (item.is_taxable && item.tax_rate) {
            taxAmount = (item.selling_price / 100) * item.cartQuantity * (parseFloat(item.tax_rate) / 100);
          }

          return {
            product_id: item.id,
            quantity: item.cartQuantity.toString(),
            unit_price: item.selling_price,
            unit_cost: item.cost_price,
            tax_amount: Math.round(taxAmount * 100),
          };
        }),
      }).unwrap();

      if (!sale?.id) {
        throw new Error('Sale creation did not return a valid sale id.');
      }

      const completedSale: Sale = await completeSale({
        id: sale.id,
        data: {
          payments: [
            {
              method,
              amount: Math.round(total * 100),
              reference: reference || undefined,
            },
          ],
        },
      }).unwrap();

      const tenderedAmount = method === 'cash' ? tendered : total;
      const completedChange = Math.max(0, tenderedAmount - total);

      setCompletion({
        saleNumber: completedSale.sale_number,
        total,
        change: completedChange,
        paymentMethod: method,
        paymentTypeLabel: methodLabel,
        completedAt: completedSale.completed_at || new Date().toISOString(),
      });

      dispatch(clearCart());
      setStage(4);
      setPaymentTypeLabel(paymentTypeOptions[0]?.label ?? '');
      setAmountTendered('');
      setReference('');
    } catch (err: unknown) {
      const errorObject = err as { data?: { message?: string; error?: string }; message?: string };
      setError(errorObject?.data?.message || errorObject?.data?.error || errorObject?.message || 'Failed to process payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            {stage === 2 && 'Review Sale'}
            {stage === 3 && 'Complete Payment'}
            {stage === 4 && 'Sale Completed'}
          </h2>
          <p className={styles.subtitle}>
            {stage === 2 && 'Review the products before moving to payment.'}
            {stage === 3 && 'Complete the payment in one focused screen.'}
            {stage === 4 && 'The sale is complete and ready for the next customer.'}
          </p>
        </div>
      </div>

      {stage === 4 && completion ? (
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12.5 11.5 15 15.5 9.5" />
            </svg>
          </div>
          <h3>Sale completed successfully</h3>
          <p>{completion.saleNumber} is now recorded and ready for printing or sharing.</p>

          <div className={styles.successSummary}>
            <div>
              <span className={styles.summaryLabel}>Total</span>
              <strong>{formatAmount(completion.total)}</strong>
            </div>
            <div>
              <span className={styles.summaryLabel}>Payment</span>
              <strong>{completion.paymentTypeLabel}</strong>
            </div>
            <div>
              <span className={styles.summaryLabel}>Change</span>
              <strong>{formatAmount(completion.change)}</strong>
            </div>
          </div>

          <div className={styles.successMeta}>
            Completed at {new Date(completion.completedAt).toLocaleString()}
          </div>

          <div className={styles.inlineActions}>
            <Button variant="primary" size="lg" onClick={handleStartNewSale}>
              Start New Sale
            </Button>
          </div>
        </div>
      ) : stage === 2 ? (
        <>
          <div className={styles.stageFocus}>
            <div className={styles.stageHeader}>
              <h3>Review sale</h3>
              <span>{cart.length} item{cart.length === 1 ? '' : 's'}</span>
            </div>

            {cart.length === 0 ? (
              <div className={styles.emptyFlow}>
                <div className={styles.emptyIcon}>🛒</div>
                <h3>No products selected yet</h3>
                <p>Go back to product selection to add items for this sale.</p>
              </div>
            ) : (
              <div className={styles.itemsList}>
                {cart.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{item.name}</h4>
                      <span className={styles.itemPrice}>{formatAmount(item.selling_price / 100)}</span>
                    </div>

                    <div className={styles.itemControls}>
                      <div className={styles.qtyControl}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.cartQuantity - 1 }))}
                          disabled={isProcessing}
                        >
                          -
                        </button>
                        <span className={styles.qtyValue}>{item.cartQuantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.cartQuantity + 1 }))}
                          disabled={isProcessing}
                        >
                          +
                        </button>
                      </div>
                      <div className={styles.itemTotal}>
                        {formatAmount((item.selling_price / 100) * item.cartQuantity)}
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => dispatch(removeFromCart(item.id))}
                        disabled={isProcessing}
                        aria-label={`Remove ${item.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{formatAmount(subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Tax</span>
              <span>{formatAmount(tax)}</span>
            </div>
            {discount > 0 && (
              <div className={`${styles.totalRow} ${styles.discountRow}`}>
                <span>Discount</span>
                <span>-{formatAmount(discount)}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Total</span>
              <span>{formatAmount(total)}</span>
            </div>
          </div>

          <div className={styles.inlineActions}>
            <Button variant="outline" size="lg" onClick={onBackToSelection}>
              Back to Products
            </Button>
            <Button variant="primary" size="lg" onClick={handleGoToPayment} disabled={cart.length === 0}>
              Continue to Payment
            </Button>
          </div>
        </>
      ) : (
        <div className={styles.stageFocus}>
          <div className={styles.stageHeader}>
            <h3>Complete payment</h3>
            <span>{locationName}</span>
          </div>

          {salesChannelLabel ? (
            <div className={styles.channelSummary}>
              <span className={styles.summaryLabel}>Sales channel</span>
              <strong>{salesChannelLabel}</strong>
            </div>
          ) : null}

          <div className={styles.paymentSummary}>
            <div>
              <span className={styles.summaryLabel}>Items</span>
              <strong>{cart.length}</strong>
            </div>
            <div>
              <span className={styles.summaryLabel}>Total due</span>
              <strong>{formatAmount(total)}</strong>
            </div>
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.paymentSection}>
            <Select
              label="Payment Method"
              value={activePaymentTypeLabel}
              onChange={(e) => {
                const nextLabel = e.target.value;
                setPaymentTypeLabel(nextLabel);
                const nextMethod = paymentTypeOptions.find((option) => option.label === nextLabel)?.method ?? 'other';
                if (nextMethod === 'cash' && !amountTendered) {
                  setAmountTendered(total.toFixed(2));
                }
              }}
              disabled={isProcessing}
            >
              {paymentTypeOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
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
                  <span className={styles.changeAmount}>{formatAmount(change)}</span>
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
          </div>

          <div className={styles.inlineActions}>
            <Button variant="outline" size="lg" onClick={() => setStage(2)} disabled={isProcessing}>
              Back to Review
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirmPayment}
              disabled={isProcessing || isLocationsLoading || cart.length === 0}
            >
              {isProcessing ? 'Processing...' : isLocationsLoading ? 'Loading locations...' : 'Complete Sale'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
