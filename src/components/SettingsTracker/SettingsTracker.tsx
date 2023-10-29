import { memo, useEffect } from "react";
import { useFileJsonContent } from "../../features/fs/useFileJsonContent";
import { useSettings } from "../../features/settings/hooks";
import { Settings } from "../../schemas/settings";

export const SettingsTracker = memo(function SettingsTracker({ path }: { path: string }) {
  const settings = useFileJsonContent(path, Settings);
  const { setIconThemeId } = useSettings();

  useEffect(() => {
    if (settings.content) {
      setIconThemeId(settings.content.iconThemeId);
    }
  }, [setIconThemeId, settings.content]);

  return null;
});
