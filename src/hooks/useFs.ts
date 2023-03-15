import { useFaradayHost } from "@contexts/faradayHostContext";
import { CombinedFsProvider } from "@features/fs/combinedFs";
import { useMemo } from "react";

export function useFs() {
  const host = useFaradayHost();
  const fs = useMemo(() => new CombinedFsProvider({ "faraday:": host.faradayFs, "file:": host.rootFs }), [host]);
  return fs;
}
