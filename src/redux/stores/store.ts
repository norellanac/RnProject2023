import { configureStore } from '@reduxjs/toolkit';
import { pokemonApi } from '../../services/pokemonApi';
import authSlice from '../slices/authSlice';
//https://codevoweb.com/setup-redux-toolkit-and-rtk-query/

export const store = configureStore({
  reducer: {
    authUser: authSlice,
    [pokemonApi.reducerPath]: pokemonApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({}).concat([pokemonApi.middleware]),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getstate>;
export type AppDispatch = typeof store.dispatch;
