import { useState } from "react";
import { InferStateType, state } from "react-rehoox";
import { QuickViewDefinition } from "../../schemas/manifest";
import { combine } from "../../utils/path";
import { useFileStringContent } from "../../features/fs/useFileStringContent";

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
