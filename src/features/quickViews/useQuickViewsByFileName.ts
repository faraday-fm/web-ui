import { useMemo } from "react";
import { useQuickViews } from "./useQuickViews";
import { FileName, FullyQualifiedQuickView } from "../extensions/types";

export function useQuickViewsByFileName() {
  const quickViews = useQuickViews();
  return useMemo(() => {
    const result: Record<FileName, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([extId, eqv]) => {
      Object.values(eqv).forEach((qv) => {
        if (qv.quickView.filenames) {
          qv.quickView.filenames.forEach((fileName) => {
            (result[fileName] ??= []).push({ extId, quickView: qv.quickView, script: qv.script });
          });
        }
      });
    });
    return result;
  }, [quickViews]);
}
