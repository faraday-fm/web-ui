import type { JSX, PropsWithChildren } from "react";
import { css } from "../../../features/styles";
import type { CursorStyle } from "./types";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

interface CellProps {
  cursorStyle: CursorStyle;
  selected?: boolean;
  onMouseOver?: React.MouseEventHandler<HTMLDivElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
}

// function createDragGhost() {
//   const div = document.createElement("div");
//   div.innerText = "Copy !@#$";
//   div.style.transform = "translate(-10000px, -10000px)";
//   div.style.position = "absolute";
//   document.body.appendChild(div);
//   return div;
// }

export function Cell({ children, selected, cursorStyle, onMouseDown, onMouseOver, onDoubleClick }: PropsWithChildren<CellProps>) {
  const isTouchscreen = useMediaQuery("(pointer: coarse)");

  const clickHandler = isTouchscreen ? { onClick: onDoubleClick } : { onDoubleClick };

  return (
    <div
      draggable
      className={css("cell", `-${cursorStyle}`, selected ? "-selected" : "")}
      style={{ background: selected ? "red" : undefined }}
      onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}
      {...clickHandler}
    >
      {children}
    </div>
  );
}
