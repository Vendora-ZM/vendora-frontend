import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { productsApi } from './features/products/productsApi';
import productsReducer from './features/products/productsSlice';
import { salesApi } from './features/sales/salesApi';
import salesReducer from './features/sales/salesSlice';
import posReducer from './features/pos/posSlice';
import { customersApi } from './features/customers/customersApi';
import customersReducer from './features/customers/customersSlice';
import { analyticsApi } from './features/analytics/analyticsApi';
import analyticsReducer from './features/analytics/analyticsSlice';
import { authApi } from './features/auth/authApi';
import authReducer from './features/auth/authSlice';
import { locationsApi } from './features/locations/locationsApi';
import { inventoryApi } from './features/inventory/inventoryApi';
import inventoryReducer from './features/inventory/inventorySlice';
import { profileApi } from './features/profile/profileApi';
import { accountsApi } from './features/accounts/accountsApi';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    [productsApi.reducerPath]: productsApi.reducer,
    sales: salesReducer,
    [salesApi.reducerPath]: salesApi.reducer,
    pos: posReducer,
    customers: customersReducer,
    [customersApi.reducerPath]: customersApi.reducer,
    analytics: analyticsReducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [accountsApi.reducerPath]: accountsApi.reducer,
    [locationsApi.reducerPath]: locationsApi.reducer,
    inventory: inventoryReducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(productsApi.middleware)
      .concat(salesApi.middleware)
      .concat(customersApi.middleware)
      .concat(analyticsApi.middleware)
      .concat(authApi.middleware)
      .concat(profileApi.middleware)
      .concat(accountsApi.middleware)
      .concat(locationsApi.middleware)
      .concat(inventoryApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
