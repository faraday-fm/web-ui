import { useFarMoreHost } from "~/src/contexts/farMoreHostContext";
import { useEffect, useMemo } from "react";
import { useAppSelector } from "~/src/store";

export function useTerminal() {
  const path = useAppSelector((state) => state.panels.states[state.panels.active].path);
  const host = useFarMoreHost();
  // const callbacks = useMemo<((data: Uint8Array) => void)[]>(() => [], []);
  // useEffect(() => {
  //   host.terminal.subscribe((f, p: any) => {
  //     callbacks.forEach((cb) => cb(p.payload as Uint8Array));
  //     return Promise.resolve();
  //   });
  // }, [callbacks, host]);
  return useMemo(() => {
    const size = { rows: 25, cols: 80 };
    return {
      run: async (command: string) => {
        return host.terminal.run({ command, cwd: path, rows: size.rows, cols: size.cols });
      },
      send: async (data: string) => {
        host.terminal.sendTtyData(data);
      },
      resize: (newCols: number, newRows: number) => {
        size.cols = newCols;
        size.rows = newRows;
        host.terminal.setTtySize(size);
      },
      onData: (callback: (data: Uint8Array) => void) => {
        // callbacks.push(callback);
      },
    };
  }, [path, host]);
}
