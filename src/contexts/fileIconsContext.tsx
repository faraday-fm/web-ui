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
const defaultDirIcon = btoa(
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 4H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-1.11-.9-2-2-2h-8l-2-2z" fill="#90a4ae" /></svg>'
);
const defaultFileIcon = btoa(
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m5 2H6v16h12v-9h-7V4z" fill="#90a4ae" /></svg>'
);

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

function FileIcon({ svg }: { svg: string }) {
  return <div className={css("file-icon")} style={{ backgroundImage: `url('data:image/svg+xml;base64,${svg}')` }} />;
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
        return <FileIcon svg={isDir ? defaultDirIcon : defaultFileIcon} />;
      }

      const iconDefinitionName = resolveIconDefinitionName(theme, path, isDir);
      const cachedIcon = cache.get(iconDefinitionName);

      if (cachedIcon) {
        if (isPromise(cachedIcon)) {
          return cachedIcon
            .then((svg) => {
              cache.set(iconDefinitionName, svg);
              return <FileIcon svg={svg} />;
            })
            .catch(() => undefined);
        }
        return <FileIcon svg={cachedIcon} />;
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
          const svgPromise = svgContent.then(parseSvg).then((svg) => btoa(svg));
          cache.set(iconDefinitionName, svgPromise);
          return svgPromise.then((svg) => <FileIcon svg={svg} />).catch(() => undefined);
        }
        const svg = btoa(parseSvg(svgContent));
        cache.set(iconDefinitionName, svg);
        return <FileIcon svg={svg} />;
      } catch {
        return undefined;
      }
    },
    [cache, fs, theme, themePath]
  );

  return <FileIconsContext.Provider value={resolver}>{children}</FileIconsContext.Provider>;
}
