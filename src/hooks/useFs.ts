import { useMemo } from "react";

import { useRpcChannel } from "../contexts/rpcChannelContext";

export type FsEntry = {
  parent?: FsEntry;
  name: string;
  ext?: string;
  dir?: boolean;
  file?: boolean;
  symlink?: boolean;
  size?: number;
  created?: number;
  accessed?: number;
  modified?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;
};

export function useFs() {
  const rpc = useRpcChannel();
  return useMemo(
    () => ({
      async listDir(dir: string) {
        return (await rpc.call("listDir", dir)) as FsEntry[];
      },
      async getRootDir() {
        return (await rpc.call("getRootDir", undefined)) as FsEntry;
      },
      async getHomeDir() {
        return (await rpc.call("getHomeDir", undefined)) as FsEntry;
      },
    }),
    [rpc]
  );
}
