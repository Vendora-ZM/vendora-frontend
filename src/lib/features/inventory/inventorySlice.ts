import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InventoryState {
  isAdjustModalOpen: boolean;
  isTransferModalOpen: boolean;
  selectedProductId: string | null;
}

const initialState: InventoryState = {
  isAdjustModalOpen: false,
  isTransferModalOpen: false,
  selectedProductId: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    openAdjustModal(state, action: PayloadAction<string>) {
      state.isAdjustModalOpen = true;
      state.selectedProductId = action.payload;
    },
    closeAdjustModal(state) {
      state.isAdjustModalOpen = false;
      state.selectedProductId = null;
    },
    openTransferModal(state, action: PayloadAction<string>) {
      state.isTransferModalOpen = true;
      state.selectedProductId = action.payload;
    },
    closeTransferModal(state) {
      state.isTransferModalOpen = false;
      state.selectedProductId = null;
    },
  },
});

export const {
  openAdjustModal,
  closeAdjustModal,
  openTransferModal,
  closeTransferModal,
} = inventorySlice.actions;

export default inventorySlice.reducer;
