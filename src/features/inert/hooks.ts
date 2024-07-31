import { useStore } from "zustand";
import { useAppStore } from "../store";

export function useInert() {
  return useStore(useAppStore(), (s) => s.inert);
}
