import { memo, useEffect } from "react";
import { useExtensionStates } from "../../features/extensions/useExtensionStates";
import { useFileJsonContent } from "../../features/fs/hooks";
import { ExtensionManifest } from "../../schemas/manifest";
import { combine } from "../../utils/path";
import { ExtensionContributions } from "./ExtensionContributions";
import { getExtId } from "./utils";

export const Extension = memo(function Extension({ path }: { path: string }) {
  const { setExtensionManifest, activateExtension, deactivateExtension } = useExtensionStates();
  const manifest = useFileJsonContent(combine(path, "package.json"), ExtensionManifest);
  if (manifest.error) {
    console.error("Cannot load extension.", path, manifest.error);
  }

  useEffect(() => {
    if (manifest.content) {
      const id = getExtId(manifest.content);
      activateExtension(id);
      setExtensionManifest(id, manifest.content);
      return () => {
        deactivateExtension(id);
      };
    }
  }, [activateExtension, deactivateExtension, manifest.content, setExtensionManifest]);

  return manifest.content ? <ExtensionContributions path={path} manifest={manifest.content} /> : null;
});
