import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DateRangePreset = 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month';

interface AnalyticsState {
  dateRangePreset: DateRangePreset;
  locationId: string | undefined;
}

const initialState: AnalyticsState = {
  dateRangePreset: 'last_30_days',
  locationId: undefined,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRangePreset(state, action: PayloadAction<DateRangePreset>) {
      state.dateRangePreset = action.payload;
    },
    setLocationId(state, action: PayloadAction<string | undefined>) {
      state.locationId = action.payload;
    },
  },
});

export const { setDateRangePreset, setLocationId } = analyticsSlice.actions;
export default analyticsSlice.reducer;
