import { createContext, PropsWithChildren, useContext } from "react";
import { FaradayHost } from "../types";

const FaradayHostContext = createContext<FaradayHost | undefined>(undefined);

export function useFaradayHost() {
  const result = useContext(FaradayHostContext);
  if (!result) {
    throw new Error("FaradayHostProvider is not registered.");
  }
  return result;
}

interface FaradayHostProviderProps extends PropsWithChildren {
  host: FaradayHost;
}

export function FaradayHostProvider({ host, children }: FaradayHostProviderProps) {
  return <FaradayHostContext.Provider value={host}>{children}</FaradayHostContext.Provider>;
}
