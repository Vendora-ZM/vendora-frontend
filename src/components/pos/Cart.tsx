'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { updateQuantity, removeFromCart, clearCart, openPaymentModal } from '@/lib/features/pos/posSlice';
import styles from './Cart.module.css';

export const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cart, discountAmount } = useAppSelector((s) => s.pos);

  const subtotal = cart.reduce((acc, item) => {
    return acc + ((item.selling_price / 100) * item.cartQuantity);
  }, 0);

  // Simplified tax calculation for POS display: sum of (tax_rate/100 * price * qty) for taxable items
  const tax = cart.reduce((acc, item) => {
    if (item.is_taxable && item.tax_rate) {
      const rate = parseFloat(item.tax_rate) / 100;
      return acc + ((item.selling_price / 100) * item.cartQuantity * rate);
    }
    return acc;
  }, 0);

  const discount = parseFloat(discountAmount) || 0;
  const total = subtotal + tax - discount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    dispatch(openPaymentModal());
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Current Sale</h2>
        <button
          className={styles.clearBtn}
          onClick={() => dispatch(clearCart())}
          disabled={cart.length === 0}
        >
          Clear
        </button>
      </div>

      <div className={styles.itemsList}>
        {cart.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛒</div>
            <p>Cart is empty</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemInfo}>
                <h4 className={styles.itemName}>{item.name}</h4>
                <span className={styles.itemPrice}>K{(item.selling_price / 100).toFixed(2)}</span>
              </div>
              
              <div className={styles.itemControls}>
                <div className={styles.qtyControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.cartQuantity - 1 }))}
                  >
                    -
                  </button>
                  <span className={styles.qtyValue}>{item.cartQuantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.cartQuantity + 1 }))}
                  >
                    +
                  </button>
                </div>
                <div className={styles.itemTotal}>
                  K{((item.selling_price / 100) * item.cartQuantity).toFixed(2)}
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => dispatch(removeFromCart(item.id))}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>K{subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>Tax</span>
          <span>K{tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className={`${styles.totalRow} ${styles.discountRow}`}>
            <span>Discount</span>
            <span>-K{discount.toFixed(2)}</span>
          </div>
        )}
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <span>Total</span>
          <span>K{total.toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.holdBtn} disabled={cart.length === 0}>
          Hold Sale
        </button>
        <button
          className={styles.checkoutBtn}
          disabled={cart.length === 0}
          onClick={handleCheckout}
        >
          Pay K{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
};
