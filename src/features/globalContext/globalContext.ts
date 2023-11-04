import { StateCreator } from "zustand";

interface State {
  "filePanel.selectedName"?: string;
  "filePanel.path"?: string;
  "filePanel.isFileSelected"?: boolean;
  "filePanel.isDirectorySelected"?: boolean;
}

interface Actions {
  updateState(newState: Partial<State>): void;
}

export type GlobalContextSlice = State & Actions;

export const createGlobalContextSlice: StateCreator<GlobalContextSlice> = (set) => ({
  updateState: (newState) => set(newState),
});
