import { useMemo } from "react";
import { useQuickViews } from "./useQuickViews";
import { FileName, FullyQualifiedQuickView } from "./types";

export function useQuickViewsByFileName() {
  const quickViews = useQuickViews();
  return useMemo(() => {
    const result: Record<FileName, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([qvId, qv]) => {
      if (!qv.definition || !qv.isActive || !qv.quickViewScript) {
        return;
      }
      const quickView = qv.definition;
      const script = qv.quickViewScript;
      if (qv.definition.filenames) {
        qv.definition.filenames.forEach((fileName) => {
          (result[fileName] ??= []).push({ extId: qvId, quickView, script });
        });
      }
    });
    return result;
  }, [quickViews]);
}
