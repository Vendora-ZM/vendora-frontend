import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationSeverity = 'info' | 'warning' | 'critical';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: string;
  read: boolean;
};

interface NotificationsState {
  items: NotificationItem[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<NotificationItem[]>) {
      state.items = action.payload;
    },
    markAllNotificationsRead(state) {
      state.items.forEach((item) => {
        item.read = true;
      });
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const { setNotifications, markAllNotificationsRead, clearNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;
