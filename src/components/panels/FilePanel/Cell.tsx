import { useFileIconResolver } from "@contexts/fileIconsContext";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import isPromise from "is-promise";
import { MouseEventHandler, ReactElement, useEffect, useMemo, useState } from "react";
import styled, { DefaultTheme } from "styled-components";

import { CursorStyle } from "./types";

type CellProps = {
  cursorStyle: CursorStyle;
  data: any;
  field: string;
  onMouseOver?: MouseEventHandler<HTMLDivElement>;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
};

function getColor(theme: DefaultTheme, name: string, dir: boolean | undefined, selected: boolean) {
  if (dir) return selected ? theme.filePanel.entries.dir.activeColor : theme.filePanel.entries.dir.inactiveColor;
  // if (name.startsWith(".")) return selected ? "var(--color-01)" : "var(--color-02)";
  // if (name.endsWith(".toml") || name.endsWith(".json")) return selected ? "var(--color-01)" : "var(--color-10)";
  return selected ? theme.filePanel.entries.file.activeColor : theme.filePanel.entries.file.inactiveColor;
}

const Root = styled.div<{ cursorStyle: CursorStyle }>`
  display: flex;
  margin-right: 1px;
  cursor: default;
  overflow: hidden;
  background-color: ${(p) => (p.cursorStyle === "firm" || p.cursorStyle === "inactive" ? p.theme.filePanel.activeBg : null)};
  /* ${(p) => p.cursorStyle === "firm" && "filter: invert(1);"} */
`;

const LineItem = styled.span<{ $data: { name: string; isDir: boolean | undefined }; $cursorStyle: CursorStyle }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 calc(0.25rem - 1px);
  flex-grow: 1;
  color: ${(p) => getColor(p.theme, p.$data?.name, p.$data?.isDir, p.$cursorStyle === "firm")};
`;

export function Cell({ cursorStyle, data, field, onMouseDown, onMouseOver, onDoubleClick }: CellProps) {
  const iconResolver = useFileIconResolver();
  const { height } = useGlyphSize();

  const resolvedIcon = useMemo(() => iconResolver(data?.[field] ?? "", data?.isDir ?? false), [data, field, iconResolver]);

  const emptyIcon = <div style={{ width: 17 }} />;
  const [icon, setIcon] = useState<ReactElement | undefined>(!isPromise(resolvedIcon) ? resolvedIcon ?? emptyIcon : emptyIcon);

  useEffect(() => {
    (async () => {
      const iconElement = await resolvedIcon;
      if (iconElement) {
        setIcon(iconElement);
      }
    })();
  }, [resolvedIcon]);

  return (
    <Root cursorStyle={cursorStyle} onMouseDown={onMouseDown} onMouseOver={onMouseOver} onDoubleClick={onDoubleClick}>
      <div style={{ filter: cursorStyle === "firm" ? "grayscale(0.5)" : undefined }}>{icon}</div>
      <LineItem $data={data} $cursorStyle={cursorStyle} style={{ lineHeight: `${height}px` }}>
        {String(data?.[field] ?? "\u00A0")}
      </LineItem>
    </Root>
  );
}
