import { useStore } from "zustand";
import { useAppStore } from "../store";

export function useExtensions() {
  return useStore(useAppStore(), (s) => s.extensions);
}
