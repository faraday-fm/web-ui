import { useCallback } from "react";
import { from, state } from "react-rehoox";
import { useFileSystem } from "../features/fs/FileSystemContext";
import { ContextVariables } from "./contextVariables/contextVariables";
import { Extensions } from "./extensions/Extensions";
import { GlobalContext } from "./globalContext/GlobalContext";
import { Inert } from "./inert";
import { Panels } from "./panels/Panels";
import { Settings } from "./settings/Settings";

export function RootStore() {
  const fs = useFileSystem();

  return state({
    fs: useCallback(() => fs, [fs]),
    extensions: from(Extensions, { root: "file:~/.faraday/extensions" }),
    settings: from(Settings, { path: "file:~/.faraday/settings.json5" }),
    panels: from(Panels),
    globalContext: from(GlobalContext),
    contextVariables: from(ContextVariables),
    inert: from(Inert),
  });
}
