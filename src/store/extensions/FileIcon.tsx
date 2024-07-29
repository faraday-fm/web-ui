import { useCallback, useEffect, useState } from "react";
import { state } from "react-rehoox";
import { FontIconDefinition, IconTheme, SvgIconDefinition, isSvgIcon } from "../../schemas/iconTheme";
import { filename } from "../../utils/path";
import { useFileStringContent } from "../../features/fs/hooks";

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

export function FileIcon({ path, isDir, iconTheme }: { path: string; isDir: boolean; iconTheme: IconTheme }) {
  const iconDefinitionName = resolveIconDefinitionName(iconTheme, path, isDir);
  const iconDefinition = iconTheme.iconDefinitions[iconDefinitionName];
  const [svgIcon, setSvgIcon] = useState<SvgIconDefinition>();
  const [fontIcon, setFontIcon] = useState<FontIconDefinition>();

  useEffect(() => {
    if (isSvgIcon(iconDefinition)) {
      setSvgIcon(iconDefinition);
    } else {
      setFontIcon(iconDefinition);
    }
  }, [iconDefinition]);

  const svg = useFileStringContent({ path: svgIcon?.iconPath, skip: !svgIcon });

  const createNode = useCallback(() => {
    if (typeof svg.content !== "undefined") {
      return (
        <div
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,${svg.content}')`,
          }}
        />
      );
    } else {
      return <div>{fontIcon?.fontCharacter}</div>;
    }
  }, [fontIcon?.fontCharacter, svg.content]);

  return state({
    createNode,
  });
}
