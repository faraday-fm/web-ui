import { useState } from "react";
import { InferStateType, from, state } from "react-rehoox";
import { ExtensionContributions } from "./ExtensionContributions";
import { useFileJsonContent } from "../../features/fs/useFileJsonContent";
import { combine } from "../../utils/path";
import { ExtensionManifest } from "../../schemas/manifest";

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
