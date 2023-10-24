import { useMemo } from "react";
import { useQuickViews } from "./useQuickViews";
import { FullyQualifiedQuickView, Mimetype } from "../extensions/types";

export function useQuickViewsByMimetype() {
  const quickViews = useQuickViews();
  return useMemo(() => {
    const result: Record<Mimetype, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([extId, eqv]) => {
      Object.values(eqv).forEach((qv) => {
        if (qv.quickView.mimetypes) {
          qv.quickView.mimetypes.forEach((mimetype) => {
            (result[mimetype] ??= []).push({ extId, quickView: qv.quickView, script: qv.script });
          });
        }
      });
    });
    return result;
  }, [quickViews]);
}
