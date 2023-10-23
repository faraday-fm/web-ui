import { useExtensions } from "@features/extensions/hooks";
import { useFileJsonContent, useFileStringContent } from "@features/fs/hooks";
import { ExtensionRepoSchema } from "@schemas/extensionRepo";
import { ExtensionManifest, ExtensionManifestSchema, QuickView } from "@schemas/manifest";
import { combine } from "@utils/path";
import { useEffect, useMemo } from "react";

function getExtId(extension: ExtensionManifest) {
  return `${extension.publisher}.${extension.name}`;
}

export function QuickViewContribution({ path, extension, quickView }: { path: string; extension: ExtensionManifest; quickView: QuickView }) {
  const quickViewScript = useFileStringContent(combine(path, quickView.path));
  const { addQuickView, deleteQuickView } = useExtensions();

  useEffect(() => {
    if (!quickViewScript.content) {
      return undefined;
    }
    addQuickView(getExtId(extension), quickView, quickViewScript.content);
    return () => {
      deleteQuickView(getExtId(extension), quickView.id);
    };
  }, [addQuickView, deleteQuickView, extension, quickView, quickViewScript.content]);

  return null;
}

function ExtensionContributions({ path, extension }: { path: string; extension: ExtensionManifest }) {
  const quickViews = useMemo(
    () =>
      extension.contributes?.quickViews?.map((qv) => (
        <QuickViewContribution key={`${getExtId(extension)}.${qv.id}`} path={path} extension={extension} quickView={qv} />
      )) ?? [],
    [extension, path]
  );
  return quickViews;
}

function Extension({ path }: { path: string }) {
  const manifest = useFileJsonContent(`${path}/package.json`, ExtensionManifestSchema);
  if (manifest.error) {
    console.error("Cannot load extension.", manifest.error);
  }

  return manifest.content ? <ExtensionContributions path={path} extension={manifest.content} /> : null;
}

export function ExtensionsRoot({ root }: { root: string }) {
  const repo = useFileJsonContent(`${root}/extensions.json`, ExtensionRepoSchema);
  if (repo.error) {
    console.error("extensions.json is corrupted.", repo.error);
  }

  const exts = useMemo(
    () => repo.content?.map((ext) => <Extension key={ext.identifier.uuid} path={combine(root, ext.relativeLocation)} />) ?? null,
    [repo.content, root]
  );

  return exts;
}
