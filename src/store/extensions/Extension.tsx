import { InferStateType, from, state } from "effie";
import { useState } from "react";
import { useFileJsonContent } from "../../features/fs/useFileJsonContent";
import { ExtensionManifest } from "../../schemas/manifest";
import { combine } from "../../utils/path";
import { ExtensionContributions } from "./ExtensionContributions";

export function Extension({ path, id }: { path: string; id: string }) {
  const [isActive, setIsActive] = useState(true);
  const { content: manifest, error } = useFileJsonContent({
    path: combine(path, "package.json"),
    schema: ExtensionManifest,
    skip: !isActive,
  });

  if (error) {
    console.error("Cannot load extension manifest.", error);
  }

  return state({
    id,
    manifest,
    isLoaded: manifest != null,
    isLoading: isActive && manifest == null,
    isActive,
    setIsActive,
    contributions: isActive && manifest ? from(ExtensionContributions, { extensionHomePath: path, manifest }) : undefined,
  });
}

export type ExtensionState = InferStateType<ReturnType<typeof Extension>>;
