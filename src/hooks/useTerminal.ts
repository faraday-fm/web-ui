import { useRpcChannel } from "~/src/contexts/rpcChannelContext";
import { useEffect, useMemo } from "react";
import { useAppSelector } from "~/src/store";

export function useTerminal() {
  const path = useAppSelector((state) => state.panels.states[state.panels.active].path);
  const rpc = useRpcChannel();
  const callbacks = useMemo<((data: Uint8Array) => void)[]>(() => [], []);
  useEffect(() => {
    rpc.subscribe((f, p: any) => {
      callbacks.forEach((cb) => cb(p.payload as Uint8Array));
      return Promise.resolve();
    });
  }, [callbacks, rpc]);
  return useMemo(() => {
    const size = { rows: 25, cols: 80 };
    return {
      run: async (command: string) => {
        return rpc.call("runCommand", { command, cwd: path, rows: size.rows, cols: size.cols });
      },
      send: async (data: string) => {
        rpc.call("sendTtyData", data);
      },
      resize: (newCols: number, newRows: number) => {
        size.cols = newCols;
        size.rows = newRows;
        rpc.call("sendTtySize", size);
      },
      onData: (callback: (data: Uint8Array) => void) => {
        callbacks.push(callback);
      },
    };
  }, [callbacks, path, rpc]);
}
