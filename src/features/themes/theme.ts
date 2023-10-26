import { StateCreator } from "zustand";
import { Theme } from "./types";
import { baseTheme } from "./themes";

interface State {
  theme: Theme;
}

interface Actions {
  setTheme(theme: Theme): void;
}

export type ThemeSlice = State & Actions;

export const createThemeSlice: StateCreator<ThemeSlice> = (set) => ({
  theme: baseTheme(),

  setTheme: (theme) => set({ theme }),
});
