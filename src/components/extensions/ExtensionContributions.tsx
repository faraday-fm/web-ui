import { memo } from "react";
import type { ExtensionManifest } from "../../schemas/manifest";
import { IconThemeContribution } from "./IconThemeContribution";
import { QuickViewContribution } from "./QuickViewContribution";
import { getExtId, getQuickViewId } from "./utils";

export const ExtensionContributions = memo(({ path, manifest }: { path: string; manifest: ExtensionManifest }) => {
  const quickViews =
    manifest.contributes?.quickViews?.map((qv) => (
      <QuickViewContribution key={getQuickViewId(manifest, qv)} path={path} manifest={manifest} quickView={qv} />
    )) ?? [];

  const iconThemes =
    manifest.contributes?.iconThemes?.map((it) => (
      <IconThemeContribution key={`${getExtId(manifest)}.${it.id}`} path={path} manifest={manifest} iconTheme={it} />
    )) ?? [];
  return <>{quickViews.concat(iconThemes)}</>;
});
