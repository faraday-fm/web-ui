import { FaradayHost } from "@types";
import { createContext, PropsWithChildren, useContext } from "react";

const FaradayHostContext = createContext<FaradayHost>({} as FaradayHost);

export function useFaradayHost() {
  return useContext(FaradayHostContext);
}

interface FaradayHostProviderProps extends PropsWithChildren {
  host: FaradayHost;
}

export function FaradayHostProvider({ host, children }: FaradayHostProviderProps) {
  return <FaradayHostContext.Provider value={host}>{children}</FaradayHostContext.Provider>;
}
