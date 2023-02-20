// import { shell } from "@tauri-apps/api";
import { useMemo } from "react";
import { isRunningUnderTauri } from "@utils/tauriUtils";

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
    []
  );
}
