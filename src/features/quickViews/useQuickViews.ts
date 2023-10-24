import { useExtensions } from "../extensions/useExtensions";

export function useQuickViews() {
  return useExtensions().quickViews;
}
