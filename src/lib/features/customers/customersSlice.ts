import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '@/types/customer';

interface CustomersUIState {
  searchQuery: string;
  selectedCustomer: Customer | null;
  isFormModalOpen: boolean;
  isDeleteModalOpen: boolean;
  modalMode: 'create' | 'edit';
}

const initialState: CustomersUIState = {
  searchQuery: '',
  selectedCustomer: null,
  isFormModalOpen: false,
  isDeleteModalOpen: false,
  modalMode: 'create',
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    openCreateModal(state) {
      state.selectedCustomer = null;
      state.modalMode = 'create';
      state.isFormModalOpen = true;
    },
    openEditModal(state, action: PayloadAction<Customer>) {
      state.selectedCustomer = action.payload;
      state.modalMode = 'edit';
      state.isFormModalOpen = true;
    },
    closeFormModal(state) {
      state.isFormModalOpen = false;
      state.selectedCustomer = null;
    },
    openDeleteModal(state, action: PayloadAction<Customer>) {
      state.selectedCustomer = action.payload;
      state.isDeleteModalOpen = true;
    },
    closeDeleteModal(state) {
      state.isDeleteModalOpen = false;
      state.selectedCustomer = null;
    },
  },
});

export const {
  setSearchQuery,
  openCreateModal,
  openEditModal,
  closeFormModal,
  openDeleteModal,
  closeDeleteModal,
} = customersSlice.actions;

export default customersSlice.reducer;
