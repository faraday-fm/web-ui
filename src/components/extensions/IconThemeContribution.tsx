import { memo, useEffect } from "react";
import { useFileJsonContent } from "../../features/fs/hooks";
import { IconThemeSchema } from "../../schemas/iconTheme";
import { ExtensionManifest, IconThemeDefinition } from "../../schemas/manifest";
import { combine, truncateLastDir } from "../../utils/path";
import { getIconThemeId } from "./utils";
import { useExtensionStates } from "../../features/extensions/useExtensionStates";

export const IconThemeContribution = memo(function IconThemeContribution({
  path,
  manifest,
  iconTheme,
}: {
  path: string;
  manifest: ExtensionManifest;
  iconTheme: IconThemeDefinition;
}) {
  const id = getIconThemeId(manifest, iconTheme);
  const { iconThemes, activateIconTheme, deactivateIconTheme, setIconTheme, setIconThemeDefinition } = useExtensionStates();
  const isActive = iconThemes[id]?.isActive;
  const filePath = combine(path, iconTheme.path);
  const dirPath = truncateLastDir(filePath);
  const theme = useFileJsonContent(filePath, IconThemeSchema, !isActive);

  useEffect(() => {
    setIconThemeDefinition(id, iconTheme);
  }, [iconTheme, id, setIconThemeDefinition]);

  useEffect(() => {
    activateIconTheme(id);

    return () => {
      deactivateIconTheme(id);
    };
  }, [activateIconTheme, deactivateIconTheme, id]);

  useEffect(() => {
    if (!theme.content) {
      return undefined;
    }
    setIconTheme(id, dirPath, theme.content);
  }, [id, dirPath, setIconTheme, theme.content]);

  return null;
});
