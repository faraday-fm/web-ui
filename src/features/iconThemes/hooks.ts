import { useExtensionStates } from "../extensions/useExtensionStates";

export function useIconThemes() {
  return useExtensionStates().iconThemes;
}
