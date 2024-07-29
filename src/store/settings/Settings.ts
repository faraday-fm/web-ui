import { state } from "effie";
import { useFileJsonContent } from "../../features/fs/hooks";
import { Settings as SettingsSchema } from "../../schemas/settings";

export function Settings({ path }: { path: string }) {
  const settings = useFileJsonContent({ path, schema: SettingsSchema });

  return state({
    iconThemeId: settings.content?.iconThemeId ?? "",
  });
}
