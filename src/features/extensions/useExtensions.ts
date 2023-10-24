import { useAppStore } from "@features/store";
import { useStore } from "zustand";

export function useExtensions() {
  return useStore(useAppStore(), (s) => s.extensions);
}
