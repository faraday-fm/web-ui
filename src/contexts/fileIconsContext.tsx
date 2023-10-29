import isPromise from "is-promise";
import { PropsWithChildren, ReactNode, createContext, useCallback, useContext, useMemo } from "react";
import { useFs } from "../features/fs/hooks";
import { useIconThemes } from "../features/iconThemes/hooks";
import { useSettings } from "../features/settings/hooks";
import { css } from "../features/styles";
import { IconTheme, isSvgIcon } from "../schemas/iconTheme";
import { combine, filename } from "../utils/path";

export type IconResolver = (path: string, isDir: boolean) => ReactNode | PromiseLike<ReactNode>;

const FileIconsContext = createContext<IconResolver>(() => undefined);

const decoder = new TextDecoder();
const parseSvg = decoder.decode.bind(decoder);

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
  // const [iconTheme, setIconTheme] = useState<{ path: string; theme: IconTheme }>();
  const iconThemeId = useSettings().iconThemeId;
  const iconThemes = useIconThemes();
  const iconTheme = iconThemes[iconThemeId];
  const theme = iconTheme?.theme;
  const themePath = iconTheme?.path;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cache = useMemo(() => new Map<string, Promise<string> | string>(), [iconTheme]);

  const resolver: IconResolver = useCallback(
    (path, isDir) => {
      if (!theme || !themePath) {
        return undefined;
      }

      const iconDefinitionName = resolveIconDefinitionName(theme, path, isDir);
      const cachedIcon = cache.get(iconDefinitionName);

      if (cachedIcon) {
        if (isPromise(cachedIcon)) {
          return cachedIcon
            .then((svg) => {
              cache.set(iconDefinitionName, svg);
              return <div className={css("FileIcon")} dangerouslySetInnerHTML={{ __html: svg }} />;
            })
            .catch(() => undefined);
        }
        return <div className={css("FileIcon")} dangerouslySetInnerHTML={{ __html: cachedIcon }} />;
      }
      const iconDefinition = iconDefinitionName ? theme.iconDefinitions[iconDefinitionName] : undefined;
      const iconPath = isSvgIcon(iconDefinition) ? iconDefinition.iconPath : undefined;
      const iconPathAbsolute = iconPath ? combine(themePath, iconPath) : undefined;
      if (!iconPathAbsolute) {
        return undefined;
      }

      try {
        const svgContent = fs.readFile(iconPathAbsolute);
        if (isPromise(svgContent)) {
          const svgPromise = svgContent.then(parseSvg);
          cache.set(iconDefinitionName, svgPromise);
          return svgPromise
            .then((svg) => {
              return <div className={css("FileIcon")} dangerouslySetInnerHTML={{ __html: svg }} />;
            })
            .catch(() => undefined);
        }
        const svg = parseSvg(svgContent);
        cache.set(iconDefinitionName, svg);
        return <div className={css("FileIcon")} dangerouslySetInnerHTML={{ __html: svg }} />;
      } catch {
        return undefined;
      }
    },
    [cache, fs, theme, themePath]
  );

  return <FileIconsContext.Provider value={resolver}>{children}</FileIconsContext.Provider>;
}
