import { useStore } from "zustand";
import { useAppStore } from "../store";

export function useSettings() {
  return useStore(useAppStore(), (s) => s.settings);
}
