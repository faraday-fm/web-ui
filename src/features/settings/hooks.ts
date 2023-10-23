import { useAppStore } from "@features/store";
import { useStore } from "zustand";

export function useSettings() {
  return useStore(useAppStore(), (s) => s.settings);
}
