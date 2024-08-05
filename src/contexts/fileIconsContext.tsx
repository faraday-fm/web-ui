import isPromise from "is-promise";
import { type PropsWithChildren, type ReactNode, createContext, useCallback, useContext, useMemo } from "react";
import { useIconThemes } from "../features/extensions/hooks";
import { useFs } from "../features/fs/hooks";
import { useSettings } from "../features/settings/settings";
import { css } from "../features/styles";
import { type IconTheme, isSvgIcon } from "../schemas/iconTheme";
import { combine, filename } from "../utils/path";
import { filestream } from "../features/fs/filestream";
import { streamToUint8Array } from "../features/fs/streamToUint8Array";

export type IconResolver = (path: string, isDir: boolean, isOpen: boolean) => ReactNode | PromiseLike<ReactNode>;

const FileIconsContext = createContext<IconResolver>(() => undefined);

const decoder = new TextDecoder();
const parseSvg = (u: Uint8Array) => decoder.decode(u);
const defaultDirIcon = btoa(
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 4H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-1.11-.9-2-2-2h-8l-2-2z" fill="#90a4ae" /></svg>',
);
const defaultDirOpenIcon = btoa(
  '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M28.96692,12H9.44152a2,2,0,0,0-1.89737,1.36754L4,24V10H28a2,2,0,0,0-2-2H15.1241a2,2,0,0,1-1.28038-.46357L12.5563,6.46357A2,2,0,0,0,11.27592,6H4A2,2,0,0,0,2,8V24a2,2,0,0,0,2,2H26l4.80523-11.21213A2,2,0,0,0,28.96692,12Z" fill="#90a4ae" /></svg>',
);
const defaultFileIcon = btoa(
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m5 2H6v16h12v-9h-7V4z" fill="#90a4ae" /></svg>',
);

export function useFileIconResolver() {
  return useContext(FileIconsContext);
}

function resolveIconDefinitionName(iconTheme: IconTheme, path: string, isDir: boolean, isOpen: boolean, languageId?: string): string {
  const defaultDef = isDir ? (isOpen ? iconTheme.folderExpanded ?? iconTheme.folder : iconTheme.folder) : iconTheme.file;
  const direntName = filename(path);
  if (!direntName) {
    return defaultDef;
  }
  if (isDir) {
    return (isOpen ? iconTheme.folderNamesExpanded?.[direntName] : iconTheme.folderNames?.[direntName]) ?? defaultDef;
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
  const { iconThemes } = useIconThemes();
  const iconTheme = iconThemeId ? iconThemes[iconThemeId] : undefined;
  const theme = iconTheme?.theme;
  const themePath = iconTheme?.path;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const cache = useMemo(() => new Map<string, Promise<string> | string>(), [iconTheme]);

  const resolver: IconResolver = useCallback(
    (path, isDir, isOpen) => {
      if (!theme || !themePath) {
        return <FileIcon svg={isDir ? (isOpen ? defaultDirOpenIcon : defaultDirIcon) : defaultFileIcon} />;
      }

      const iconDefinitionName = resolveIconDefinitionName(theme, path, isDir, isOpen);
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
        const svgContent = streamToUint8Array(filestream(fs, iconPathAbsolute));
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
    [cache, fs, theme, themePath],
  );

  return <FileIconsContext.Provider value={resolver}>{children}</FileIconsContext.Provider>;
}
