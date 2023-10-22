import { useAppStore } from "@features/store";
import { useStore } from "zustand";
import { PanelsSlice } from "./panels";

/* @internal */
export function usePanels(): PanelsSlice {
  return useStore(useAppStore(), (s) => s.panels);
}

/* @internal */
export function usePanelState(id: string) {
  return usePanels().states[id]?.at(-1);
}
