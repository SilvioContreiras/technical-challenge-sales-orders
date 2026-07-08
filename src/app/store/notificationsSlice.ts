import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type NotificationVariant = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  variant: NotificationVariant;
  message: string;
}

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notify: {
      reducer(state, action: PayloadAction<Notification>) {
        state.items.push(action.payload);
      },
      prepare(payload: { variant: NotificationVariant; message: string }) {
        return { payload: { id: nanoid(), ...payload } };
      },
    },
    dismiss(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { notify, dismiss } = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
