import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  businessId: string | null;
}

const initialState: AuthState = {
  // Try to determine if we are logged in from localStorage initially, but cookies handle the real auth.
  // We'll keep it simple: assume false until logged in, or we can just rely on API errors to log us out.
  isAuthenticated: false,
  businessId: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ businessId: string }>) => {
      state.isAuthenticated = true;
      state.businessId = action.payload.businessId;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.businessId = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
