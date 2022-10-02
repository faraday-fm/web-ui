import { createContext, PropsWithChildren, useContext } from "react";
import { DummyFarMoreHost } from "~/src/features/rpc/dummyRpcChannel";

import { FarMoreHost } from "~/src/types";

const FarMoreHostContext = createContext<FarMoreHost>(new DummyFarMoreHost());

export function useFarMoreHost() {
  return useContext(FarMoreHostContext);
}

interface FarMoreHostProviderProps extends PropsWithChildren {
  host: FarMoreHost;
}

export function FarMoreHostProvider({ host, children }: FarMoreHostProviderProps) {
  return <FarMoreHostContext.Provider value={host}>{children}</FarMoreHostContext.Provider>;
}
