import { useAppStore } from "@features/store";
import { useStore } from "zustand";

export function useContextVariables() {
  return useStore(useAppStore(), (s) => s.contextVariables);
}
