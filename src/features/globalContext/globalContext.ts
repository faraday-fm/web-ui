import { create } from "zustand";

interface State {
  "filePanel.selectedName"?: string;
  "filePanel.selectedPath"?: string;
  "filePanel.isFileSelected"?: boolean;
  "filePanel.isDirectorySelected"?: boolean;
}

interface Actions {
  updateState(newState: Partial<State>): void;
}

export const useGlobalContext = create<State & Actions>((set) => ({
  updateState: (newState) => set(newState),
}));
