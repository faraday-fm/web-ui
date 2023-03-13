import { useFileJsonContent } from "@hooks/useFileContent";
import { useFs } from "@hooks/useFs";
import { append } from "@utils/path";
import { createContext, PropsWithChildren, useCallback, useContext, useMemo } from "react";
import styled from "styled-components";

export type IconResolver = (path: string, isDir: boolean) => Promise<React.ReactElement | undefined>;

const FileIconsContext = createContext<IconResolver>(() => Promise.reject());

const themeRoot = "far-more:/icons";

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

function resolveIconDefinitionName(iconTheme: any, path: string, isDir: boolean): string {
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
  const packageJson = useFileJsonContent(append(themeRoot, "package.json"));

  const iconThemes = packageJson?.contributes?.iconThemes;
  const iconsThemeJsonPath = Array.isArray(iconThemes) ? (iconThemes[0]?.path as string) : undefined;
  const iconsThemeJsonPathAbsolute = append(themeRoot, iconsThemeJsonPath ?? "");

  const iconsThemeJson = useFileJsonContent(iconsThemeJsonPathAbsolute);
  // console.log(iconsThemeJson);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cache = useMemo(() => new Map<string, string>(), [packageJson]);

  const resolver: IconResolver = useCallback(
    async (path, isDir) => {
      if (!iconsThemeJson) {
        return undefined;
      }
      const iconDefinitionName = resolveIconDefinitionName(iconsThemeJson, path, isDir);
      const cachedIcon = cache.get(iconDefinitionName);

      if (cachedIcon) {
        // eslint-disable-next-line react/no-danger
        return (
          <IconWrapper
            ref={(dref) => {
              if (dref) dref.innerHTML = cachedIcon;
            }}
          />
        );
      }

      const iconDefinition = iconDefinitionName ? iconsThemeJson.iconDefinitions[iconDefinitionName] : undefined;
      const iconPath = iconDefinition?.iconPath;
      const iconPathAbsolute = iconPath ? new URL(iconPath, iconsThemeJsonPathAbsolute).href : undefined;
      if (!iconPathAbsolute) {
        return undefined;
      }

      const svgContent = decoder.decode(await fs.readFile(iconPathAbsolute));

      cache.set(iconDefinitionName, svgContent);

      return (
        <IconWrapper
          ref={(dref) => {
            if (dref) dref.innerHTML = svgContent;
          }}
        />
      );
    },
    [cache, fs, iconsThemeJson, iconsThemeJsonPathAbsolute]
  );

  return <FileIconsContext.Provider value={resolver}>{children}</FileIconsContext.Provider>;
}
