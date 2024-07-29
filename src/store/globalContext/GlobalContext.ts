import { useCallback, useState } from "react";
import { state } from "react-rehoox";

export interface State {
  "filePanel.selectedName"?: string;
  "filePanel.path"?: string;
  "filePanel.isFileSelected"?: boolean;
  "filePanel.isDirectorySelected"?: boolean;
}

export function GlobalContext() {
  const [context, setContext] = useState<State>({});
  return state({
    context,
    updateState: useCallback((newState: State) => setContext(newState), []),
  });
}
