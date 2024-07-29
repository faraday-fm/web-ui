import { useAppSelector } from "../store";
import { IconThemeContributionState } from "./IconThemeContribution";

export function useIconThemes() {
  return useAppSelector((state) => {
    const result: Record<string, IconThemeContributionState> = {};
    state.extensions.forEach((e) => {
      e.contributions?.iconThemes.forEach((t) => {
        result[t.id] = t;
      });
    });
    return result;
  });
}
