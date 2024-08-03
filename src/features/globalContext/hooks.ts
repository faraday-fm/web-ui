import { atom, useAtom } from "jotai";
import { useCallback } from "react";

interface State {
  "filePanel.selectedName"?: string;
  "filePanel.path"?: string;
  "filePanel.isFileSelected"?: boolean;
  "filePanel.isDirectorySelected"?: boolean;
}

const globalContextAtom = atom<State>({});

export function useGlobalContext() {
  const [globalContext, setGlobalContext] = useAtom(globalContextAtom);

  const updateState = useCallback((newState: Partial<State>) => setGlobalContext((ctx) => ({ ...ctx, ...newState })), [setGlobalContext]);

  return { globalContext, updateState };
}
