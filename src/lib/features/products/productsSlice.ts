import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/product';

interface ProductsUIState {
  searchQuery: string;
  selectedCategoryId: string | null;
  selectedProduct: Product | null;
  isFormModalOpen: boolean;
  isDeleteModalOpen: boolean;
  modalMode: 'create' | 'edit';
}

const initialState: ProductsUIState = {
  searchQuery: '',
  selectedCategoryId: null,
  selectedProduct: null,
  isFormModalOpen: false,
  isDeleteModalOpen: false,
  modalMode: 'create',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string | null>) {
      state.selectedCategoryId = action.payload;
    },
    openCreateModal(state) {
      state.selectedProduct = null;
      state.modalMode = 'create';
      state.isFormModalOpen = true;
    },
    openEditModal(state, action: PayloadAction<Product>) {
      state.selectedProduct = action.payload;
      state.modalMode = 'edit';
      state.isFormModalOpen = true;
    },
    closeFormModal(state) {
      state.isFormModalOpen = false;
      state.selectedProduct = null;
    },
    openDeleteModal(state, action: PayloadAction<Product>) {
      state.selectedProduct = action.payload;
      state.isDeleteModalOpen = true;
    },
    closeDeleteModal(state) {
      state.isDeleteModalOpen = false;
      state.selectedProduct = null;
    },
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  openCreateModal,
  openEditModal,
  closeFormModal,
  openDeleteModal,
  closeDeleteModal,
} = productsSlice.actions;

export default productsSlice.reducer;
