import { atom, useAtom } from "jotai";
import { useCallback } from "react";

interface State {
  "filePanel.activeName"?: string;
  "filePanel.path"?: string;
  "filePanel.isFileActive"?: boolean;
  "filePanel.isDirectoryActive"?: boolean;
}

const globalContextAtom = atom<State>({});

export function useGlobalContext() {
  const [globalContext, setGlobalContext] = useAtom(globalContextAtom);

  const updateState = useCallback((newState: Partial<State>) => setGlobalContext((ctx) => ({ ...ctx, ...newState })), [setGlobalContext]);

  return { globalContext, updateState };
}
