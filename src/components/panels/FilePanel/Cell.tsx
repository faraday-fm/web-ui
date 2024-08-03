import type { JSX, PropsWithChildren } from "react";
import { css } from "../../../features/styles";
import type { CursorStyle } from "./types";

interface CellProps {
  cursorStyle: CursorStyle;
  onMouseOver?: React.MouseEventHandler<HTMLDivElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function Cell({ children, cursorStyle, onMouseDown, onMouseOver, onDoubleClick }: PropsWithChildren<CellProps>) {
  return (
    // biome-ignore lint/a11y/useKeyWithMouseEvents: <explanation>
    <div className={css("cell", `-${cursorStyle}`)} onMouseDown={onMouseDown} onMouseOver={onMouseOver} onDoubleClick={onDoubleClick}>
      {children}
    </div>
  );
}
