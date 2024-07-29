import { InferStateType, from, state } from "react-rehoox";
import { IconThemeContribution } from "./IconThemeContribution";
import { QuickViewContribution } from "./QuickViewContribution";
import { ExtensionManifest } from "../../schemas/manifest";

export function ExtensionContributions({ extensionHomePath, manifest }: { extensionHomePath: string; manifest: ExtensionManifest }) {
  const contributes = manifest.contributes;
  return state({
    quickViews: contributes?.quickViews?.map((quickView) => from(QuickViewContribution, { extensionHomePath, quickView })) ?? [],
    iconThemes: contributes?.iconThemes?.map((iconTheme) => from(IconThemeContribution, { extensionHomePath, iconTheme })) ?? [],
  });
}

export type ExtensionContributionsState = InferStateType<ReturnType<typeof ExtensionContributions>>;
