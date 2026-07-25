import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/product';

export interface CartItem extends Product {
  cartQuantity: number;
  discountApplied?: string;
}

interface PosState {
  cart: CartItem[];
  customerId: string | null;
  discountAmount: string;
}

const initialState: PosState = {
  cart: [],
  customerId: null,
  discountAmount: '0',
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.cart.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.cartQuantity += 1;
      } else {
        state.cart.push({ ...action.payload, cartQuantity: 1 });
      }
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.cart.find((i) => i.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.cart = state.cart.filter((i) => i.id !== action.payload.id);
        } else {
          item.cartQuantity = action.payload.quantity;
        }
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.cart = state.cart.filter((i) => i.id !== action.payload);
    },
    clearCart(state) {
      state.cart = [];
      state.discountAmount = '0';
      state.customerId = null;
    },
    setCustomer(state, action: PayloadAction<string | null>) {
      state.customerId = action.payload;
    },
    setDiscount(state, action: PayloadAction<string>) {
      state.discountAmount = action.payload;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCustomer,
  setDiscount,
} = posSlice.actions;

export default posSlice.reducer;
