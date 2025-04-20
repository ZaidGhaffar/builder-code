import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';
import { historyMiddleware } from './historyMiddleware';

const store = configureStore({
  reducer: {
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(historyMiddleware),
});

export default store;