import { useGlyphSize } from "@contexts/glyphSizeContext";
import { MouseEventHandler } from "react";
import styled, { DefaultTheme } from "styled-components";

import { CursorStyle } from "../../types";

type RowProps = {
  cursorStyle: CursorStyle;
  data: any;
  field: string;
  onMouseOver?: MouseEventHandler<HTMLDivElement>;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
};

function getColor(theme: DefaultTheme, name: string, dir: boolean | undefined, selected: boolean) {
  if (dir) return selected ? theme.filePanel.entries.dir.activeColor : theme.filePanel.entries.dir.inactiveColor;
  // if (name.startsWith(".")) return selected ? "var(--color-01)" : "var(--color-02)";
  // if (name.endsWith(".toml") || name.endsWith(".json")) return selected ? "var(--color-01)" : "var(--color-10)";
  return selected ? theme.filePanel.entries.file.activeColor : theme.filePanel.entries.file.inactiveColor;
}

const Root = styled.div<{ cursorStyle: CursorStyle }>`
  display: flex;
  cursor: default;
  background-color: ${(p) => (p.cursorStyle === "firm" || p.cursorStyle === "inactive" ? p.theme.filePanel.activeBg : null)};
`;

const LineItem = styled.span<{ $data: { name: string; isDir: boolean | undefined }; $cursorStyle: CursorStyle }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 calc(0.25rem - 1px);
  flex-grow: 1;
  color: ${(p) => getColor(p.theme, p.$data.name, p.$data.isDir, p.$cursorStyle === "firm")};
`;

export function Row({ cursorStyle, data, field, onMouseDown, onMouseOver }: RowProps) {
  const { height } = useGlyphSize();
  return (
    <Root cursorStyle={cursorStyle} onMouseDown={onMouseDown} onMouseOver={onMouseOver}>
      <LineItem $data={data} $cursorStyle={cursorStyle} style={{ lineHeight: `${height}px` }}>
        {String(data[field]) ?? "\u00A0"}
      </LineItem>
    </Root>
  );
}
