import { useStore } from "zustand";
import { useAppStore } from "../store";

export function useGlobalContext() {
  return useStore(useAppStore(), (s) => s.globalContext);
}
