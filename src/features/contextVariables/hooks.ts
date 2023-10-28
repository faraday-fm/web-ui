import { useStore } from "zustand";
import { useAppStore } from "../store";

export function useContextVariables() {
  return useStore(useAppStore(), (s) => s.contextVariables);
}
