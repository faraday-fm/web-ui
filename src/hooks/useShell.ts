/* eslint-disable */
/* @ts-ignore */
// import { shell } from "@tauri-apps/api";
import { isRunningUnderTauri } from "@utils/tauriUtils";
import { useMemo } from "react";

export function useShell() {
  return useMemo(
    () => ({
      open: (url: string) => {
        if (isRunningUnderTauri()) {
          // shell.open(url);
        } else {
          window.open(url, "_blank");
        }
      },
    }),
    [],
  );
}
