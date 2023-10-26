/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { MouseEventHandler, PropsWithChildren } from "react";

import { CursorStyle } from "./types";
import { css } from "@features/styles";

interface CellProps {
  cursorStyle: CursorStyle;
  onMouseOver?: MouseEventHandler<HTMLDivElement>;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
}

export function Cell({ children, cursorStyle, onMouseDown, onMouseOver, onDoubleClick }: PropsWithChildren<CellProps>) {
  return (
    <div className={css("Cell", `-${cursorStyle}`)} onMouseDown={onMouseDown} onMouseOver={onMouseOver} onDoubleClick={onDoubleClick}>
      {children}
    </div>
  );
}
