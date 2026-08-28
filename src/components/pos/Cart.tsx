'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { clearCart, removeFromCart, updateQuantity } from '@/lib/features/pos/posSlice';
import { useCreateSaleMutation, useCompleteSaleMutation } from '@/lib/features/sales/salesApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { useGetBalancesQuery } from '@/lib/features/inventory/inventoryApi';
import { PaymentMethod, Sale } from '@/types/sale';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { buildPaymentTypeOptions, getPaymentTypeLabel } from '@/lib/business/paymentTypes';
import { formatCurrency } from '@/lib/utils/currency';
import { getFriendlyErrorMessage } from '@/lib/errors/apiError';
import styles from './Cart.module.css';

type CheckoutStage = 2 | 3 | 4;

const REVIEW_PAGE_SIZE = 10;

type SaleSummary = {
  saleNumber: string;
  total: number;
  change: number;
  paymentMethod: PaymentMethod;
  paymentTypeLabel: string;
  completedAt: string;
  locationName: string;
};

type StockIssue = {
  productId: string;
  name: string;
  requestedQuantity: number;
  availableQuantity: number;
  shortage: number;
};

interface CartProps {
  initialStage?: CheckoutStage;
  currencyCode?: string;
  paymentTypes?: string[];
  salesChannelLabel?: string;
  onBackToSelection?: () => void;
  onStartNewSale?: () => void;
}

function parseQuantityInput(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(0, Math.floor(parsed));
}

function parseQuantityValue(value: string | number | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export const Cart: React.FC<CartProps> = ({
  initialStage = 2,
  currencyCode,
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
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completion, setCompletion] = useState<SaleSummary | null>(null);
  const [reviewPage, setReviewPage] = useState(0);
  const reviewPagesRef = useRef<HTMLDivElement | null>(null);

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

  const reviewPages = useMemo(() => {
    const pages = [];
    for (let index = 0; index < cart.length; index += REVIEW_PAGE_SIZE) {
      pages.push(cart.slice(index, index + REVIEW_PAGE_SIZE));
    }
    return pages;
  }, [cart]);
  const maxReviewPage = Math.max(reviewPages.length - 1, 0);
  const safeReviewPage = Math.min(reviewPage, maxReviewPage);

  const defaultLocation = useMemo(
    () => locations.find((location) => location.is_default) ?? locations[0],
    [locations],
  );
  const effectiveSelectedLocationId = selectedLocationId || defaultLocation?.id || '';
  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === effectiveSelectedLocationId) ?? defaultLocation,
    [defaultLocation, effectiveSelectedLocationId, locations],
  );
  const locationName = selectedLocation?.name ?? 'Select branch';
  const formatAmount = (amount: number) => formatCurrency(amount, { currencyCode });

  const {
    data: inventoryBalances = [],
    isLoading: isInventoryLoading,
    isFetching: isInventoryFetching,
  } = useGetBalancesQuery(
    { location_id: effectiveSelectedLocationId },
    { skip: !effectiveSelectedLocationId },
  );

  const stockByProductId = useMemo(
    () =>
      inventoryBalances.reduce<Record<string, number>>((acc, balance) => {
        acc[balance.product_id] = parseQuantityValue(balance.quantity_available);
        return acc;
      }, {}),
    [inventoryBalances],
  );

  const stockIssues = useMemo<StockIssue[]>(() => {
    if (!effectiveSelectedLocationId) {
      return [];
    }

    return cart
      .map((item) => {
        const availableQuantity = stockByProductId[item.id] ?? 0;
        const requestedQuantity = item.cartQuantity;
        const shortage = requestedQuantity - availableQuantity;

        if (shortage <= 0) {
          return null;
        }

        return {
          productId: item.id,
          name: item.name,
          requestedQuantity,
          availableQuantity,
          shortage,
        };
      })
      .filter((issue): issue is StockIssue => Boolean(issue));
  }, [cart, effectiveSelectedLocationId, stockByProductId]);

  const stockIssueByProductId = useMemo(
    () =>
      stockIssues.reduce<Record<string, StockIssue>>((acc, issue) => {
        acc[issue.productId] = issue;
        return acc;
      }, {}),
    [stockIssues],
  );
  const hasStockIssues = stockIssues.length > 0;
  const isStockStatePending = Boolean(effectiveSelectedLocationId) && (isInventoryLoading || isInventoryFetching);

  useEffect(() => {
    if (stage !== 2 || !reviewPagesRef.current) {
      return;
    }

    const viewport = reviewPagesRef.current;
    viewport.scrollTo({
      left: safeReviewPage * viewport.clientWidth,
      behavior: 'auto',
    });
  }, [safeReviewPage, reviewPages.length, stage]);

  const handleReviewPagesScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = event.currentTarget;
    if (clientWidth === 0) {
      return;
    }

    const nextPage = Math.round(scrollLeft / clientWidth);
    setReviewPage(Math.max(0, Math.min(nextPage, maxReviewPage)));
  };

  const handleGoToPayment = () => {
    if (cart.length === 0 || hasStockIssues || isStockStatePending) return;
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

    if (!selectedLocation?.id) {
      setError('Select the branch that should own this sale before completing payment.');
      return;
    }

    if (hasStockIssues || isStockStatePending) {
      setError('One or more items are out of stock for this branch. Update the cart or switch branches before completing the sale.');
      return;
    }

    if (method === 'cash' && tendered < total) {
      setError('Amount tendered is less than the total.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const sale = await createSale({
        location_id: selectedLocation.id,
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
        locationName: selectedLocation.name,
      });

      dispatch(clearCart());
      setStage(4);
      setPaymentTypeLabel(paymentTypeOptions[0]?.label ?? '');
      setAmountTendered('');
      setReference('');
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err, 'Failed to process payment.'));
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
          <p>{completion.saleNumber} is now recorded under {completion.locationName} and ready for printing or sharing.</p>

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
              <span className={styles.summaryLabel}>Branch</span>
              <strong>{completion.locationName}</strong>
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
              <div className={styles.stageHeaderMeta}>
                <span>{cart.length} item{cart.length === 1 ? '' : 's'}</span>
                {reviewPages.length > 1 ? (
                  <span className={styles.pageIndicator}>Page {safeReviewPage + 1} of {reviewPages.length}</span>
                ) : null}
              </div>
            </div>

            <Select
              label="Branch for this sale"
              value={effectiveSelectedLocationId}
              onChange={(event) => setSelectedLocationId(event.target.value)}
              disabled={isProcessing || isLocationsLoading || locations.length === 0}
            >
              {locations.length === 0 ? (
                <option value="">No branches available</option>
              ) : (
                locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))
              )}
            </Select>

            {cart.length === 0 ? (
              <div className={styles.emptyFlow}>
                <div className={styles.emptyIcon}>🛒</div>
                <h3>No products selected yet</h3>
                <p>Go back to product selection to add items for this sale.</p>
              </div>
            ) : (
              <>
                {isStockStatePending ? (
                  <div className={`${styles.errorBanner} ${styles.stockBanner}`}>
                    <div className={styles.errorCopy}>
                      <strong>Checking branch stock</strong>
                      <span>Vendora is confirming inventory for {locationName.toLowerCase()} before you proceed.</span>
                    </div>
                  </div>
                ) : null}

                {hasStockIssues ? (
                  <div className={`${styles.errorBanner} ${styles.errorBannerLocked}`}>
                    <div className={styles.errorCopy}>
                      <strong>Some items are out of stock</strong>
                      <span>
                        {stockIssues.length === 1
                          ? `${stockIssues[0].name} is short by ${stockIssues[0].shortage} unit${stockIssues[0].shortage === 1 ? '' : 's'} at ${locationName}.`
                          : `${stockIssues.length} items are short for ${locationName}. Adjust the cart or switch branches before continuing.`}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div
                  ref={reviewPagesRef}
                  className={styles.itemsListViewport}
                  onScroll={handleReviewPagesScroll}
                  aria-label="Review sale item pages"
                >
                  {reviewPages.map((pageItems, pageIndex) => (
                    <div key={`page-${pageIndex}`} className={styles.itemsPage}>
                      <div className={styles.itemsList}>
                        {pageItems.map((item) => {
                          const stockIssue = stockIssueByProductId[item.id];
                          const availableQuantity = stockByProductId[item.id] ?? 0;

                          return (
                            <div key={item.id} className={`${styles.cartItem} ${stockIssue ? styles.cartItemOutOfStock : ''}`}>
                              <div className={styles.itemInfo}>
                                <div className={styles.itemCopy}>
                                  <h4 className={styles.itemName}>{item.name}</h4>
                                  <span className={styles.itemPrice}>{formatAmount(item.selling_price / 100)}</span>
                                </div>
                                <div className={styles.stockMeta}>
                                  {stockIssue ? (
                                    <span className={styles.outOfStockText}>
                                      Out of stock for this sale: {availableQuantity} available, {item.cartQuantity} requested
                                    </span>
                                  ) : (
                                    <span className={styles.inStockText}>
                                      {availableQuantity} available at {locationName}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className={styles.itemControls}>
                                <div className={styles.qtyControl}>
                                  <button
                                    className={styles.qtyBtn}
                                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.cartQuantity - 1 }))}
                                    disabled={isProcessing}
                                    aria-label={`Decrease quantity for ${item.name}`}
                                  >
                                    -
                                  </button>
                                  <input
                                    className={styles.qtyInput}
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={item.cartQuantity}
                                    onChange={(event) => {
                                      const nextQuantity = parseQuantityInput(event.target.value);
                                      if (nextQuantity !== null) {
                                        dispatch(updateQuantity({ id: item.id, quantity: nextQuantity }));
                                      }
                                    }}
                                    disabled={isProcessing}
                                    aria-label={`Quantity for ${item.name}`}
                                    inputMode="numeric"
                                  />
                                  <button
                                    className={styles.qtyBtn}
                                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.cartQuantity + 1 }))}
                                    disabled={isProcessing}
                                    aria-label={`Increase quantity for ${item.name}`}
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
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
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
            <Button
              variant="primary"
              size="lg"
              onClick={handleGoToPayment}
              disabled={cart.length === 0 || !selectedLocation?.id || isStockStatePending || hasStockIssues}
            >
              {isStockStatePending
                ? 'Checking stock...'
                : hasStockIssues
                  ? 'Resolve stock issues'
                  : 'Continue to Payment'}
            </Button>
          </div>
        </>
      ) : (
        <div className={styles.stageFocus}>
          <div className={styles.stageHeader}>
            <h3>Complete payment</h3>
            <span>{locationName}</span>
          </div>

          <Select
            label="Branch for this sale"
            value={effectiveSelectedLocationId}
            onChange={(event) => setSelectedLocationId(event.target.value)}
            disabled={isProcessing || isLocationsLoading || locations.length === 0}
          >
            {locations.length === 0 ? (
              <option value="">No branches available</option>
            ) : (
              locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))
            )}
          </Select>

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

          {(isStockStatePending || hasStockIssues) ? (
            <div className={`${styles.errorBanner} ${hasStockIssues ? styles.errorBannerLocked : styles.stockBanner}`}>
              <div className={styles.errorCopy}>
                <strong>{hasStockIssues ? 'Stock attention needed' : 'Checking branch stock'}</strong>
                <span>
                  {hasStockIssues
                    ? 'One or more items are still out of stock for this branch. Go back to review and adjust the cart before completing the sale.'
                    : `Vendora is refreshing inventory for ${locationName.toLowerCase()} before payment can be completed.`}
                </span>
              </div>
            </div>
          ) : null}

          <div className={styles.paymentItemsCard}>
            <div className={styles.paymentItemsHeader}>
              <span className={styles.summaryLabel}>Items in this sale</span>
              <strong>{cart.reduce((sum, item) => sum + item.cartQuantity, 0)} unit{cart.reduce((sum, item) => sum + item.cartQuantity, 0) === 1 ? '' : 's'}</strong>
            </div>
            <div className={styles.paymentItemsList}>
              {cart.map((item) => {
                const stockIssue = stockIssueByProductId[item.id];
                const availableQuantity = stockByProductId[item.id] ?? 0;

                return (
                  <div key={`payment-${item.id}`} className={`${styles.paymentItemRow} ${stockIssue ? styles.paymentItemRowAlert : ''}`}>
                    <div className={styles.paymentItemInfo}>
                      <strong className={styles.paymentItemName}>{item.name}</strong>
                      <span className={styles.paymentItemMeta}>
                        {item.cartQuantity} x {formatAmount(item.selling_price / 100)}
                      </span>
                      {stockIssue ? (
                        <span className={styles.outOfStockText}>
                          Out of stock: {availableQuantity} available, {item.cartQuantity} requested
                        </span>
                      ) : (
                        <span className={styles.inStockText}>{availableQuantity} available</span>
                      )}
                    </div>
                    <span className={styles.paymentItemTotal}>
                      {formatAmount((item.selling_price / 100) * item.cartQuantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className={styles.errorBanner}>
              <div className={styles.errorCopy}>
                <strong>Checkout error</strong>
                <span>{error}</span>
              </div>
            </div>
          ) : null}

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
            <Button variant="outline" size="lg" onClick={() => { setReviewPage(0); setStage(2); }} disabled={isProcessing}>
              Back to Review
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirmPayment}
              disabled={isProcessing || isLocationsLoading || cart.length === 0 || !selectedLocation?.id || isStockStatePending || hasStockIssues}
            >
              {isProcessing
                ? 'Processing...'
                : isStockStatePending
                  ? 'Checking stock...'
                  : hasStockIssues
                    ? 'Resolve stock issues'
                    : isLocationsLoading
                      ? 'Loading locations...'
                      : 'Complete Sale'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
