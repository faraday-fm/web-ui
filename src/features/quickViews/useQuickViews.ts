import { useAppSelector } from "../../store/store";

export function useQuickViews() {
  return useAppSelector((state) => state.extensions.flatMap((e) => e.contributions?.quickViews ?? []) ?? []);
}
