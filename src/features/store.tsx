import { lens, withLenses } from "@dhmk/zustand-lens";
import { createContext, useContext, useState } from "react";
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ExtensionsSlice, createExtensionsSlice } from "./extensions/extensions";
import { GlobalContextSlice, createGlobalContextSlice } from "./globalContext/globalContext";
import { PanelsSlice, createPanelsSlice } from "./panels/panels";
import { SettingsSlice, createSettingsSlice } from "./settings/settings";

interface Store {
  panels: PanelsSlice;
  extensions: ExtensionsSlice;
  globalContext: GlobalContextSlice;
  settings: SettingsSlice;
}

const createAppStore = createStore<Store>()(
  immer<Store>(
    withLenses({
      panels: lens(createPanelsSlice),
      extensions: lens(createExtensionsSlice),
      globalContext: lens(createGlobalContextSlice),
      settings: lens(createSettingsSlice),
    })
  )
);

const AppStoreContext = createContext<typeof createAppStore | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => createAppStore);

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

/* @internal */
export function useAppStore() {
  const api = useContext(AppStoreContext);
  if (!api) {
    throw new Error("AppStoreProvider is not registered.");
  }
  return api;
}
