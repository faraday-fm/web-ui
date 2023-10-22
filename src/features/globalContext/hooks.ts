import { useAppStore } from "@features/store";
import { useStore } from "zustand";

export function useGlobalContext() {
  return useStore(useAppStore(), (s) => s.globalContext);
}
