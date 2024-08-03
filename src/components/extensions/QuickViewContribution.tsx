import { memo, useEffect } from "react";
import { useFileStringContent } from "../../features/fs/hooks";
import { useQuickViews } from "../../features/quickViews/hooks";
import type { ExtensionManifest, QuickViewDefinition } from "../../schemas/manifest";
import { combine } from "../../utils/path";
import { getQuickViewId } from "./utils";

export const QuickViewContribution = memo(function QuickViewContribution({
  path,
  manifest,
  quickView,
}: {
  path: string;
  manifest: ExtensionManifest;
  quickView: QuickViewDefinition;
}) {
  const id = getQuickViewId(manifest, quickView);
  const { quickViews, activateQuickView, deactivateQuickView, setQuickViewScript, setQuickViewDefinition } = useQuickViews();
  const isActive = quickViews[id]?.isActive;
  const quickViewScript = useFileStringContent(combine(path, quickView.path), !isActive);

  useEffect(() => {
    setQuickViewDefinition(id, quickView);
  }, [id, quickView, setQuickViewDefinition]);

  useEffect(() => {
    activateQuickView(id);

    return () => {
      deactivateQuickView(id);
    };
  }, [activateQuickView, deactivateQuickView, id]);

  useEffect(() => {
    if (!quickViewScript.content) {
      return undefined;
    }
    setQuickViewScript(id, path, quickViewScript.content);
  }, [id, path, quickViewScript.content, setQuickViewScript]);

  return null;
});
