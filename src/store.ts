import { commandsSlice } from "@features/commands/commandsSlice";
import { extensionsSlice } from "@features/extensions/extensionsSlice";
import { globalContextSlice } from "@features/globalContext/globalContextSlice";
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { panelsSlice } from "./features/panels/panelsSlice";
import { settingsSlice } from "./features/settings/settingsSlice";

export const store = configureStore({
  reducer: {
    globalContext: globalContextSlice.reducer,
    settings: settingsSlice.reducer,
    panels: panelsSlice.reducer,
    commands: commandsSlice.reducer,
    extensions: extensionsSlice.reducer,
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

export const selectPanelState = (id: string) => (state: RootState) => {
  const ps = state.panels.states[id];
  return ps ? ps[ps.length - 1] : undefined;
};
