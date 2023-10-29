import { useExtensionStates } from "../extensions/useExtensionStates";

export function useQuickViews() {
  return useExtensionStates().quickViews;
}
