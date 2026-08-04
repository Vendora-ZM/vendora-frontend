import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  businessId: string | null;
  businessName: string | null;
  userId: string | null;
  userName: string | null;
  email: string | null;
  roleName: string | null;
  permissions: string[];
}

const initialState: AuthState = {
  // Try to determine if we are logged in from localStorage initially, but cookies handle the real auth.
  // We'll keep it simple: assume false until logged in, or we can just rely on API errors to log us out.
  isAuthenticated: false,
  businessId: null,
  businessName: null,
  userId: null,
  userName: null,
  email: null,
  roleName: null,
  permissions: [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        businessId: string;
        permissions?: string[];
        businessName?: string | null;
        userId?: string | null;
        userName?: string | null;
        email?: string | null;
        roleName?: string | null;
      }>
    ) => {
      state.isAuthenticated = true;
      state.businessId = action.payload.businessId;
      state.businessName = action.payload.businessName ?? state.businessName;
      state.userId = action.payload.userId ?? state.userId;
      state.userName = action.payload.userName ?? state.userName;
      state.email = action.payload.email ?? state.email;
      state.roleName = action.payload.roleName ?? state.roleName;
      state.permissions = action.payload.permissions ?? [];
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.businessId = null;
      state.businessName = null;
      state.userId = null;
      state.userName = null;
      state.email = null;
      state.roleName = null;
      state.permissions = [];
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
