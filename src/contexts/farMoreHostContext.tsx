import { FarMoreHost } from "@types";
import { createContext, PropsWithChildren, useContext } from "react";

const FarMoreHostContext = createContext<FarMoreHost>({} as FarMoreHost);

export function useFarMoreHost() {
  return useContext(FarMoreHostContext);
}

interface FarMoreHostProviderProps extends PropsWithChildren {
  host: FarMoreHost;
}

export function FarMoreHostProvider({ host, children }: FarMoreHostProviderProps) {
  return <FarMoreHostContext.Provider value={host}>{children}</FarMoreHostContext.Provider>;
}
