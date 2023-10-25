import { useFileIconResolver } from "@contexts/fileIconsContext";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import isPromise from "is-promise";
import { memo, useEffect, useMemo, useState } from "react";
import styled, { DefaultTheme } from "styled-components";

import { CellText } from "./CellText";
import { CursorStyle } from "./types";

interface CellProps {
  cursorStyle: CursorStyle;
  data?: { name: string; isDir?: boolean | undefined };
}

function getColor(theme: DefaultTheme, name: string, dir: boolean | undefined, selected: boolean) {
  if (dir) return selected ? theme.colors["files.directory.foreground:focus"] : theme.colors["files.directory.foreground"];
  // if (name.startsWith(".")) return selected ? "var(--color-01)" : "var(--color-02)";
  // if (name.endsWith(".toml") || name.endsWith(".json")) return selected ? "var(--color-01)" : "var(--color-10)";
  return selected ? theme.colors["files.file.foreground:focus"] : theme.colors["files.file.foreground"];
}

const LineItem = styled.span<{ $data: { name: string; isDir?: boolean | undefined }; $cursorStyle: CursorStyle }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 calc(0.25rem - 1px);
  flex-grow: 1;
  display: flex;
  color: ${(p) => getColor(p.theme, p.$data?.name, p.$data?.isDir, p.$cursorStyle === "firm")};
`;

const FileName = styled.span`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const FileExt = styled.span``;

export const FullFileName = memo(function FullFileName({ cursorStyle, data }: CellProps) {
  const iconResolver = useFileIconResolver();
  const { height } = useGlyphSize();

  const resolvedIcon = useMemo(() => iconResolver(data?.name ?? "", data?.isDir ?? false) ?? null, [data, iconResolver]);

  const emptyIcon = <div style={{ width: 17 }} />;
  const [icon, setIcon] = useState(!isPromise(resolvedIcon) ? resolvedIcon ?? emptyIcon : emptyIcon);

  useEffect(() => {
    void (async () => {
      const iconElement = isPromise(resolvedIcon) ? await resolvedIcon : resolvedIcon;
      if (iconElement) {
        setIcon(iconElement);
      }
    })();
  }, [resolvedIcon]);

  const fullName: string = data?.name ?? "";
  let fileName = fullName;
  let fileExt = "";
  if (!data?.isDir) {
    const dotIdx = fullName.lastIndexOf(".");
    if (dotIdx > 0) {
      fileName = fullName.substring(0, dotIdx);
      fileExt = fullName.substring(dotIdx + 1);
    }
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <div>{icon}</div>
      <LineItem $data={data} $cursorStyle={cursorStyle} style={{ lineHeight: `${height}px` }}>
        <FileName>
          <CellText cursorStyle={cursorStyle} text={fileName} />
        </FileName>
        <FileExt>
          <CellText cursorStyle={cursorStyle} text={fileExt} />
        </FileExt>
      </LineItem>
    </>
  );
});
