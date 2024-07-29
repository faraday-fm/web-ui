import { useMemo } from "react";
import { useQuickViews } from "./useQuickViews";
import { FullyQualifiedQuickView, Mimetype } from "./types";

export function useQuickViewsByMimetype() {
  const quickViews = useQuickViews();
  return useMemo(() => {
    const result: Record<Mimetype, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([qvId, qv]) => {
      if (!qv.definition || !qv.isActive || !qv.quickViewScript) {
        return;
      }
      const quickView = qv.definition;
      const script = qv.quickViewScript;
      if (qv.definition.mimetypes) {
        qv.definition.mimetypes.forEach((type) => {
          (result[type] ??= []).push({ extId: qvId, quickView, script });
        });
      }
    });
    return result;
  }, [quickViews]);
}
