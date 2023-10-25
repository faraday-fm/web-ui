import styled from "@emotion/styled";
import { MouseEventHandler, PropsWithChildren } from "react";

import { CursorStyle } from "./types";

interface CellProps {
  cursorStyle: CursorStyle;
  onMouseOver?: MouseEventHandler<HTMLDivElement>;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
}

const Root = styled.div<{ $cursorStyle: CursorStyle }>`
  display: flex;
  margin-right: 1px;
  cursor: default;
  overflow: hidden;
  background-color: ${(p) => (p.$cursorStyle === "firm" || p.$cursorStyle === "inactive" ? p.theme.colors["files.file.background:focus"] : null)};
  border: 1px solid ${(p) => (p.$cursorStyle === "firm" || p.$cursorStyle === "inactive" ? p.theme.colors["files.file.border:focus"] : "transparent")};
  padding: 0 2px;
  /* margin: 0 2px; */
  border-radius: 2px;
  /* ${(p) => p.$cursorStyle === "firm" && "filter: invert(1);"} */
`;

export function Cell({ children, cursorStyle, onMouseDown, onMouseOver, onDoubleClick }: PropsWithChildren<CellProps>) {
  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <Root $cursorStyle={cursorStyle} onMouseDown={onMouseDown} onMouseOver={onMouseOver} onDoubleClick={onDoubleClick}>
      {children}
    </Root>
  );
}
