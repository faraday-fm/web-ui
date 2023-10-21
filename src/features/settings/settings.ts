import { create } from "zustand";

interface State {
  wheelSensitivity: number;
  iconThemeId: string;
}

interface Actions {
  setWheelSensitivity(wheelSensitivity: number): void;
  setIconThemeId(iconThemeId: string): void;
}

export const useSettings = create<State & Actions>((set) => ({
  wheelSensitivity: 64,
  iconThemeId: "",

  setWheelSensitivity: (wheelSensitivity) => set({ wheelSensitivity }),
  setIconThemeId: (iconThemeId) => set({ iconThemeId }),
}));
