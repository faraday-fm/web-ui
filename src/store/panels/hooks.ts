import { useAppSelector } from "../store";

export function usePanels() {
  return useAppSelector((state) => state.panels);
}

export function usePanelState(panelId: string) {
  return useAppSelector((state) => state.panels.states[panelId]);
}
