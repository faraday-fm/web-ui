import { useMemo } from "react";
import { useQuickViews } from "./useQuickViews";
import { FileExtension, FullyQualifiedQuickView } from "../extensions/types";

export function useQuickViewsByFileExtension() {
  const quickViews = useQuickViews();
  return useMemo(() => {
    const result: Record<FileExtension, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([qvId, qv]) => {
      if (!qv.definition || !qv.isActive || !qv.script) {
        return;
      }
      const quickView = qv.definition;
      const script = qv.script;
      if (qv.definition.extensions) {
        qv.definition.extensions.forEach((ext) => {
          (result[ext] ??= []).push({ extId: qvId, quickView: quickView, script });
        });
      }
    });
    return result;
  }, [quickViews]);
}
