import classnames from "classnames";
import { MouseEventHandler } from "react";
import styled from "styled-components";

import { CursorStyle } from "../../types";

type RowProps = {
  cursorStyle: CursorStyle;
  data: any;
  field: string;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
};

function getColor(name: string, dir: boolean | undefined, selected: boolean) {
  if (dir && name !== "..") return "var(--color-15)";
  if (name.startsWith(".")) return selected ? "var(--color-01)" : "var(--color-02)";
  if (name.endsWith(".toml") || name.endsWith(".json")) return selected ? "var(--color-01)" : "var(--color-10)";
  return selected ? "var(--color-01)" : "var(--color-11)";
}

const Root = styled.div<{ cursorStyle: CursorStyle }>`
  display: flex;
  background-color: ${(p) => (p.cursorStyle === "firm" || p.cursorStyle === "inactive" ? "var(--color-03)" : null)};
`;

const LineItem = styled.span<{ data: any; cursorStyle: CursorStyle }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 calc(0.25rem - 1px);
  flex-grow: 1;
  color: ${(p) => getColor(p.data.name, p.data.dir, p.cursorStyle === "firm")};
`;

export function Row({ cursorStyle, data, field, onMouseDown, onDoubleClick }: RowProps) {
  return (
    <Root cursorStyle={cursorStyle} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
      <LineItem data={data} cursorStyle={cursorStyle}>
        {data[field] ?? "\u00A0"}
      </LineItem>
    </Root>
  );
}
