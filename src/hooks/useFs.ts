import { useFarMoreHost } from "@contexts/farMoreHostContext";
import { CombinedFsProvider } from "@features/fs/combinedFs";
import { useMemo } from "react";

export function useFs() {
  const host = useFarMoreHost();
  const fs = useMemo(() => new CombinedFsProvider({ "far-more:": host.farMoreFs, "file:": host.rootFs }), [host]);
  return fs;
}
