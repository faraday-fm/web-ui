import { addQuickView, deleteQuickView } from "@features/extensions/extensionsSlice";
import { useFileJsonContent, useFileStringContent } from "@hooks/useFileContent";
import { ExtensionRepoSchema } from "@schemas/extensionRepo";
import { ExtensionManifest, ExtensionManifestSchema, QuickView } from "@schemas/manifest";
import { useAppDispatch } from "@store";
import { combine } from "@utils/path";
import { useEffect, useMemo } from "react";

function getExtId(extension: ExtensionManifest) {
  return `${extension.publisher}.${extension.name}`;
}

export function QuickViewContribution({ path, extension, quickView }: { path: string; extension: ExtensionManifest; quickView: QuickView }) {
  const quickViewScript = useFileStringContent(combine(path, quickView.path));
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!quickViewScript.content) {
      return undefined;
    }
    dispatch(addQuickView({ extId: getExtId(extension), quickView, script: quickViewScript.content }));
    return () => {
      dispatch(deleteQuickView({ extId: getExtId(extension), quickViewId: quickView.id }));
    };
  }, [dispatch, extension, quickView, quickViewScript.content]);

  return null;
}

function ExtensionContributions({ path, extension }: { path: string; extension: ExtensionManifest }) {
  const quickViews =
    extension.contributes?.quickViews?.map((qv) => (
      <QuickViewContribution key={`${getExtId(extension)}.${qv.id}`} path={path} extension={extension} quickView={qv} />
    )) ?? [];
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{quickViews}</>;
}

function Extension({ path }: { path: string }) {
  const manifestJson = useFileJsonContent(`${path}/package.json`);

  const manifest = useMemo(() => {
    const { content, error } = manifestJson;
    if (error) {
      return { error };
    }
    if (!content) {
      return {};
    }
    try {
      return { content: ExtensionManifestSchema.parse(content) };
    } catch (error) {
      return { error };
    }
  }, [manifestJson]);

  return manifest.content ? <ExtensionContributions path={path} extension={manifest.content} /> : null;
}

export function ExtensionsRoot({ root }: { root: string }) {
  const json = useFileJsonContent(`${root}/extensions.json`);

  const repo = useMemo(() => {
    const { content, error } = json;
    if (error) {
      return { error };
    }
    try {
      return { content: ExtensionRepoSchema.parse(content) };
    } catch (error) {
      return { error };
    }
  }, [json]);

  const exts = useMemo(
    () => repo.content && repo.content.map((ext) => <Extension key={ext.identifier.uuid} path={combine(root, ext.relativeLocation)} />),
    [repo.content, root]
  );

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{exts}</>;
}
