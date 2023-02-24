import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { hostSlice } from "./features/host/hostSlice";
import { panelsSlice } from "./features/panels/panelsSlice";
import { settingsSlice } from "./features/settings/settingsSlice";

export const store = configureStore({
  reducer: {
    host: hostSlice.reducer,
    settings: settingsSlice.reducer,
    panels: panelsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
