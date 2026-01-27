import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';
import strategyReducer from './strategySlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    strategy: strategyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略某些非序列化值的检查
        ignoredActions: ['wallet/setDepositStatus'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
