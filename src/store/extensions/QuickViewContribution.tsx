import { InferStateType, state } from "effie";
import { useState } from "react";
import { useFileStringContent } from "../../features/fs/useFileStringContent";
import { QuickViewDefinition } from "../../schemas/manifest";
import { combine } from "../../utils/path";

export function QuickViewContribution({ extensionHomePath: path, quickView }: { extensionHomePath: string; quickView: QuickViewDefinition }) {
  const [isActive, setIsActive] = useState(true);

  const scriptPath = combine(path, quickView.path);
  const { content: quickViewScript, error } = useFileStringContent({
    path: scriptPath,
    skip: !isActive,
  });

  if (error) {
    console.error("Unable to load QuickView script from", scriptPath);
  }

  return state({
    isActive,
    setIsActive,
    quickViewScript,
    definition: quickView,
  });
}

export type QuickViewContributionState = InferStateType<ReturnType<typeof QuickViewContribution>>;
