import { useEffect, useMemo } from "react";
import { useFarMoreHost } from "~/src/contexts/farMoreHostContext";
import { useAppSelector } from "~/src/store";

export function useTerminal() {
  const path = useAppSelector((state) => state.panels.states[state.panels.active]?.path) ?? "";
  const host = useFarMoreHost();
  return useMemo(() => {
    const size = { rows: 25, cols: 80 };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onData = (data: Uint8Array) => {};

    const session = host.terminal?.createSession("zsh", path, onData, { rows: size.rows, cols: size.cols });

    return {
      send: async (data: string) => {
        const s = await session;
        if (s) {
          host.terminal?.sendData(s, data);
        }
      },
      resize: async (newCols: number, newRows: number) => {
        size.cols = newCols;
        size.rows = newRows;
        const s = await session;
        if (s) {
          host.terminal?.setTtySize(s, size);
        }
      },
      onData: (callback: (data: Uint8Array) => void) => {
        // callbacks.push(callback);
      },
    };
  }, [path, host]);
}
