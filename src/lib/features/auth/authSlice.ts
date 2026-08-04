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

const AUTH_STORAGE_KEY = 'vendora.auth.state.v1';

const defaultState: AuthState = {
  isAuthenticated: false,
  businessId: null,
  businessName: null,
  userId: null,
  userName: null,
  email: null,
  roleName: null,
  permissions: [],
};

function cloneDefaultState(): AuthState {
  return {
    ...defaultState,
    permissions: [...defaultState.permissions],
  };
}

function readStoredAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return cloneDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return cloneDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<AuthState> | null;
    if (!parsed || typeof parsed !== 'object') {
      return cloneDefaultState();
    }

    return {
      isAuthenticated: parsed.isAuthenticated ?? false,
      businessId: parsed.businessId ?? null,
      businessName: parsed.businessName ?? null,
      userId: parsed.userId ?? null,
      userName: parsed.userName ?? null,
      email: parsed.email ?? null,
      roleName: parsed.roleName ?? null,
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
    };
  } catch {
    return cloneDefaultState();
  }
}

export function getInitialAuthState(): AuthState {
  return readStoredAuthState();
}

export function persistAuthState(state: AuthState) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures so auth continues to function.
  }
}

export function clearPersistedAuthState() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage failures so sign-out still works.
  }
}

const initialState: AuthState = getInitialAuthState();

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
      state.permissions = action.payload.permissions ?? state.permissions;
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
