import { StateCreator, useStore } from "zustand";
import { useAppStore } from "../store";

interface State {
  inert: boolean;
}

interface Actions {
  setInert(inert: boolean): void;
}

export type InertSlice = State & Actions;

export const createInertSlice: StateCreator<InertSlice> = (set) => ({
  inert: false,

  setInert: (inert) => set({ inert }),
});

export function useInert() {
  return useStore(useAppStore(), (s) => s.inert);
}
