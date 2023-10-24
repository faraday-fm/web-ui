import { useMemo } from "react";
import { useQuickViews } from "./useQuickViews";
import { FileExtension, FullyQualifiedQuickView } from "../extensions/types";

export function useQuickViewsByFileExtension() {
  const quickViews = useQuickViews();
  return useMemo(() => {
    const result: Record<FileExtension, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([extId, eqv]) => {
      Object.values(eqv).forEach((qv) => {
        if (qv.quickView.extensions) {
          qv.quickView.extensions.forEach((fileExtension) => {
            (result[fileExtension] ??= []).push({ extId, quickView: qv.quickView, script: qv.script });
          });
        }
      });
    });
    return result;
  }, [quickViews]);
}
