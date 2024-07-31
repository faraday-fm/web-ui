import { lens, withLenses } from "@dhmk/zustand-lens";
import { createContext, useContext, useState } from "react";
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ContextVariablesSlice, createContextVariablesSlice } from "./contextVariables/contextVariables";
import { ExtensionStatesSlice, createExtensionStatesSlice } from "./extensions/extensionStates";
import { GlobalContextSlice, createGlobalContextSlice } from "./globalContext/globalContext";
import { PanelsSlice, createPanelsSlice } from "./panels/panels";
import { SettingsSlice, createSettingsSlice } from "./settings/settings";
import { InertSlice, createInertSlice } from "./inert/inert";

interface Store {
  panels: PanelsSlice;
  extensionStates: ExtensionStatesSlice;
  globalContext: GlobalContextSlice;
  settings: SettingsSlice;
  contextVariables: ContextVariablesSlice;
  inert: InertSlice;
}

const createAppStore = createStore<Store>()(
  immer<Store>(
    withLenses({
      panels: lens(createPanelsSlice),
      extensionStates: lens(createExtensionStatesSlice),
      globalContext: lens(createGlobalContextSlice),
      settings: lens(createSettingsSlice),
      contextVariables: lens(createContextVariablesSlice),
      inert: lens(createInertSlice),
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
