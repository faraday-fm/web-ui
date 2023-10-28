import isPromise from "is-promise";
import { PropsWithChildren, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { IconTheme, isSvgIcon } from "../schemas/iconTheme";
import { filename } from "../utils/path";
import { useFs } from "../features/fs/hooks";
import { Extension } from "../features/extensions/extension";
import { css } from "../features/styles";

export type IconResolver = (path: string, isDir: boolean) => ReactNode | PromiseLike<ReactNode>;

const FileIconsContext = createContext<IconResolver>(() => undefined);

const themeRoot = "faraday:/extensions/PKief.material-icon-theme-4.25.0";

const decoder = new TextDecoder();

export function useFileIconResolver() {
  return useContext(FileIconsContext);
}

function resolveIconDefinitionName(iconTheme: IconTheme, path: string, isDir: boolean, languageId?: string): string {
  const defaultDef = isDir ? iconTheme.folder : iconTheme.file;
  const direntName = filename(path);
  if (!direntName) {
    return defaultDef;
  }
  if (isDir) {
    return iconTheme.folderNames?.[direntName] ?? defaultDef;
  }
  let result = iconTheme.fileNames?.[direntName];
  if (result) {
    return result;
  }
  const nameParts = direntName.split(".");
  if (nameParts.length < 2) {
    return defaultDef;
  }
  for (let i = nameParts.length - 1; i > 0; i -= 1) {
    const ext = nameParts.slice(i).join(".");
    result = iconTheme.fileExtensions?.[ext];
    if (result) {
      return result;
    }
    result = languageId && iconTheme.languageIds?.[languageId];
    if (result) {
      return result;
    }
  }
  return defaultDef;
}

export function FileIconsProvider({ children }: PropsWithChildren) {
  const fs = useFs();
  const [iconTheme, setIconTheme] = useState<{ path: string; theme: IconTheme }>();

  useEffect(() => {
    void (async () => {
      const ext = new Extension(themeRoot, fs);
      await ext.load();
      const theme = await ext.getIconTheme();
      setIconTheme(theme);
    })();
  }, [fs]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cache = useMemo(() => new Map<string, string>(), [iconTheme]);

  const resolver: IconResolver = useCallback(
    (path, isDir) => {
      if (!iconTheme) {
        return undefined;
      }
      const iconDefinitionName = resolveIconDefinitionName(iconTheme.theme, path, isDir);
      const cachedIcon = cache.get(iconDefinitionName);

      if (cachedIcon) {
        return <div className={css("FileIcon")} dangerouslySetInnerHTML={{ __html: cachedIcon }} />;
      }
      const iconDefinition = iconDefinitionName ? iconTheme.theme.iconDefinitions[iconDefinitionName] : undefined;
      const iconPath = isSvgIcon(iconDefinition) ? iconDefinition.iconPath : undefined;
      const iconPathAbsolute = iconPath ? new URL(iconPath, iconTheme.path).href : undefined;
      if (!iconPathAbsolute) {
        return undefined;
      }

      const parseSvg = (svg: Uint8Array) => {
        const svgContent = decoder.decode(svg);
        cache.set(iconDefinitionName, svgContent);

        return <div className={css("FileIcon")} dangerouslySetInnerHTML={{ __html: svgContent }} />;
      };

      try {
        const readFile = fs.readFile(iconPathAbsolute);
        if (isPromise(readFile)) {
          return readFile.then(parseSvg).catch(() => undefined);
        }
        return parseSvg(readFile);
      } catch {
        return undefined;
      }
    },
    [cache, fs, iconTheme]
  );

  return <FileIconsContext.Provider value={resolver}>{children}</FileIconsContext.Provider>;
}
