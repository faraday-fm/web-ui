import { StateCreator } from "zustand";

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
