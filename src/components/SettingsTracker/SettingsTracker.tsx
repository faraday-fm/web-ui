import { memo, useEffect } from "react";
import { useFileJsonContent } from "../../features/fs/useFileJsonContent";
import { useSettings } from "../../features/settings/settings";
import { type AvailableLanguageTag, setLanguageTag } from "../../paraglide/runtime";
import { Settings } from "../../schemas/settings";

export const SettingsTracker = memo(function SettingsTracker({ path }: { path: string }) {
  const settings = useFileJsonContent(path, Settings);
  const { setIconThemeId } = useSettings();

  useEffect(() => {
    if (settings.content) {
      setIconThemeId(settings.content.iconThemeId);
      setLanguageTag((settings.content.lang ?? "en") as AvailableLanguageTag);
    }
  }, [setIconThemeId, settings.content]);

  return null;
});
