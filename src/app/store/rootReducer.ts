import { combineReducers } from '@reduxjs/toolkit';
import { notificationsReducer } from './notificationsSlice';

export const rootReducer = combineReducers({
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
