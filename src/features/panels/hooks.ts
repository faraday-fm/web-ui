import { useStore } from "zustand";
import { PanelsSlice } from "./panels";
import { useAppStore } from "../store";

export function usePanels(): PanelsSlice {
  return useStore(useAppStore(), (s) => s.panels);
}

export function usePanelState(id: string) {
  return usePanels().states[id];
}
