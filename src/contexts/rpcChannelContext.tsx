import { createContext, PropsWithChildren, useContext } from "react";

import { DummyRpcChannel } from "../features/rpc/dummyRpcChannel";
import { IRpcChannel } from "../features/rpc/rpcChannel";

const RpcChannelContext = createContext<IRpcChannel>(new DummyRpcChannel());

export function useRpcChannel() {
  return useContext(RpcChannelContext);
}

interface RpcChannelProviderProps extends PropsWithChildren<unknown> {
  channel: IRpcChannel;
}

export function RpcChannelProvider({ channel, children }: RpcChannelProviderProps) {
  return <RpcChannelContext.Provider value={channel}>{children}</RpcChannelContext.Provider>;
}
