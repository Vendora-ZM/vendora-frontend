import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sale, SaleStatus } from '@/types/sale';

interface SalesUIState {
  statusFilter: SaleStatus | '';
  selectedSale: Sale | null;
  isDetailModalOpen: boolean;
}

const initialState: SalesUIState = {
  statusFilter: '',
  selectedSale: null,
  isDetailModalOpen: false,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<SaleStatus | ''>) {
      state.statusFilter = action.payload;
    },
    openDetailModal(state, action: PayloadAction<Sale>) {
      state.selectedSale = action.payload;
      state.isDetailModalOpen = true;
    },
    closeDetailModal(state) {
      state.isDetailModalOpen = false;
      state.selectedSale = null;
    },
  },
});

export const { setStatusFilter, openDetailModal, closeDetailModal } = salesSlice.actions;
export default salesSlice.reducer;
