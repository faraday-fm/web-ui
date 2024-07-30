import { useFaradayHost } from "../../contexts/faradayHostContext";

export function useFs() {
  const host = useFaradayHost();
  return host.rootFs;
}
