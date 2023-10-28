import { useFaradayHost } from "../../contexts/faradayHostContext";
import { CombinedFsProvider } from "../../features/fs/combinedFs";
import { useState } from "react";

export function useFs() {
  const host = useFaradayHost();
  const [fs] = useState(() => new CombinedFsProvider({ "faraday:": host.faradayFs, "file:": host.rootFs }));
  return fs;
}
