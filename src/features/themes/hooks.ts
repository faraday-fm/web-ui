import { useAppStore } from "@features/store";
import { useStore } from "zustand";

export function useTheme() {
  return useStore(useAppStore(), (s) => s.theme.theme);
}
