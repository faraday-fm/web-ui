import { useMemo } from "react";
import type { FullyQualifiedQuickView, Mimetype } from "../extensions/types";
import { useQuickViews } from "./useQuickViews";

export function useQuickViewsByMimetype() {
  const { quickViews } = useQuickViews();
  return useMemo(() => {
    const result: Record<Mimetype, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([qvId, qv]) => {
      if (!qv.definition || !qv.isActive || !qv.script) {
        return;
      }
      const quickView = qv.definition;
      const script = qv.script;
      if (qv.definition.mimetypes) {
        qv.definition.mimetypes.forEach((type) => {
          (result[type] ??= []).push({
            extId: qvId,
            quickView: quickView,
            script,
          });
        });
      }
    });
    return result;
  }, [quickViews]);
}
