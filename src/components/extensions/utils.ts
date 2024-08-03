import type { ExtensionManifest, IconThemeDefinition, QuickViewDefinition } from "../../schemas/manifest";

export function getExtId(manifest: ExtensionManifest) {
  return `${manifest.publisher}.${manifest.name}`;
}

export function getQuickViewId(manifest: ExtensionManifest, quickView: QuickViewDefinition) {
  return `${getExtId(manifest)}.${quickView.id}`;
}

export function getIconThemeId(manifest: ExtensionManifest, theme: IconThemeDefinition) {
  return `${getExtId(manifest)}.${theme.id}`;
}
