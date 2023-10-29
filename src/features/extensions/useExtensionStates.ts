import { useStore } from "zustand";
import { useAppStore } from "../store";

export function useExtensionStates() {
  return useStore(useAppStore(), (s) => s.extensionStates);
}
