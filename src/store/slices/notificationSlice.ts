// src/store/slices/notificationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// Remove unused import: import { RootState } from "../index";

// --- Interfaces ---

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'maintenance' | 'service'; // Example types
  timestamp: string; // ISO string
  read: boolean;
  data?: Record<string, any>; // Optional additional data
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  // Add specific notification type toggles if needed
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  loading: boolean; // Combined loading state for simplicity
  error: string | null;
}

// --- Initial State ---

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
  },
  loading: false,
  error: null,
};

// --- Slice Definition ---

// Note: This slice currently uses synchronous reducers. 
// If fetching/updating notifications involved API calls, async thunks would be added here.

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Example: Reducer for when notifications are fetched (replace with async thunk if needed)
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.loading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
      state.error = null;
    },
    setNotificationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null; // Clear error when starting to load
      }
    },
    setNotificationError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Adds a new notification (e.g., received via push)
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Avoid duplicates if necessary
      if (!state.notifications.some(n => n.id === action.payload.id)) {
        state.notifications.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },
    // Marks a single notification as read
    markAsRead: (state, action: PayloadAction<string>) => { // Payload is notificationId
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    // Marks all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    // Deletes a single notification
    deleteNotification: (state, action: PayloadAction<string>) => { // Payload is notificationId
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    // Updates notification settings
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    clearNotificationState: (state) => {
        Object.assign(state, initialState);
    }
  },
  // Add extraReducers here if using async thunks for notifications
});

export const {
  setNotifications,
  setNotificationLoading,
  setNotificationError,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updateNotificationSettings,
  clearNotificationState,
} = notificationSlice.actions;

export default notificationSlice.reducer;
