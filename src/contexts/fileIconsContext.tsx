import { Extension } from "@features/extensions/extension";
import { useFs } from "@hooks/useFs";
import { IconTheme, isSvgIcon } from "@schemas/iconTheme";
import isPromise from "is-promise";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

export type IconResolver = (path: string, isDir: boolean) => Promise<React.ReactElement | undefined> | React.ReactElement | undefined;

const FileIconsContext = createContext<IconResolver>(() => Promise.reject());

const themeRoot = "faraday:/extensions/PKief.material-icon-theme-4.25.0";

const decoder = new TextDecoder();

export function useFileIconResolver() {
  return useContext(FileIconsContext);
}

const IconWrapper = styled.div`
  width: 17px;
  height: 17px;
  display: flex;
  & svg {
    width: 17px !important;
    height: 17px !important;
  }
`;

function resolveIconDefinitionName(iconTheme: IconTheme, path: string, isDir: boolean): string {
  const direntName = path.split("/").at(-1) ?? "";
  if (isDir) {
    return iconTheme.folderNames?.[direntName] ?? iconTheme.folder;
  }
  let result = iconTheme.fileNames?.[direntName];
  if (result) {
    return result;
  }
  const defaultDef = iconTheme.file;
  const nameParts = path.split(".");
  if (nameParts.length < 2) {
    return defaultDef;
  }
  for (let i = nameParts.length - 1; i > 0; i -= 1) {
    const ext = nameParts.slice(i).join(".");
    result = iconTheme.fileExtensions?.[ext] ?? iconTheme.languageIds?.[ext];
    if (result) {
      return result;
    }
  }
  return defaultDef;
}

export function FileIconsProvider({ children }: PropsWithChildren) {
  const fs = useFs();
  const [iconTheme, setIconTheme] = useState<{ path: string; theme: IconTheme }>();
  // const packageJson = useFileJsonContent(append(themeRoot, "package.json"));

  useEffect(() => {
    (async () => {
      const ext = new Extension(themeRoot, fs);
      await ext.load();
      const theme = await ext.getIconTheme();
      setIconTheme(theme);
    })();
  }, [fs]);

  // const iconThemes = packageJson?.contributes?.iconThemes;
  // const iconsThemeJsonPath = Array.isArray(iconThemes) ? (iconThemes[0]?.path as string) : undefined;
  // const iconsThemeJsonPathAbsolute = append(themeRoot, iconsThemeJsonPath ?? "");

  // const iconsThemeJson = useFileJsonContent(iconsThemeJsonPathAbsolute);
  // console.log(iconsThemeJson);

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
        return (
          <IconWrapper
            ref={(dref) => {
              if (dref) dref.innerHTML = cachedIcon;
            }}
          />
        );
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

        return (
          <IconWrapper
            ref={(dref) => {
              if (dref) dref.innerHTML = svgContent;
            }}
          />
        );
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
