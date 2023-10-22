import { StateCreator } from "zustand";

interface State {
  wheelSensitivity: number;
  iconThemeId: string;
}

interface Actions {
  setWheelSensitivity(wheelSensitivity: number): void;
  setIconThemeId(iconThemeId: string): void;
}

export type SettingsSlice = State & Actions;

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  wheelSensitivity: 64,
  iconThemeId: "",

  setWheelSensitivity: (wheelSensitivity) => set({ wheelSensitivity }),
  setIconThemeId: (iconThemeId) => set({ iconThemeId }),
});
