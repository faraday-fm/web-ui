/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useEffect, useMemo, useState } from "react";
import styled, { useTheme } from "styled-components";
import useResizeObserver from "use-resize-observer";
import { Border } from "@components/Border/Border";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import { clamp } from "@utils/numberUtils";

import { ColumnDef, CursorStyle } from "../../types";
import { Row } from "./Row";

type ColumnProps = {
  items: { name: string }[];
  topMostPos: number;
  cursorStyle: CursorStyle;
  cursorPos: number;
  columnDef: ColumnDef;
  initialMaxItemsCount: number;
  onMaxItemsCountChange?: (maxCount: number) => void;
  selectItem?: (position: number) => void;
  activateItem?: (position: number, shiftModifier: boolean) => void;
};

const ColumnRoot = styled.div`
  position: relative;
  display: grid;
  grid-template-rows: min-content 1fr 0.25rem;
  height: 100%;
  /* border: ${(p) => p.theme.filePanel.column.border.thickness} solid ${(p) => p.theme.filePanel.column.border.color};
  border-right: none;
  border-bottom: none;
  border-radius: ${(p) => p.theme.filePanel.column.border.radius}; */
  text-align: left;
  box-sizing: border-box;
  padding-top: calc(0.5rem - 1px);
  /* &:last-child {
    border-right: ${(p) => p.theme.filePanel.column.border.thickness} solid ${(p) => p.theme.filePanel.column.border.color};
  } */
`;
const ColumnHeader = styled.div`
  text-align: center;
  color: ${(p) => p.theme.filePanel.column.color};
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 0 calc(0.25rem - 1px);
`;

const TopScroller = styled.div`
  position: absolute;
  height: 0.25rem;
  left: 0;
  right: 0;
  top: 0.5rem;
  cursor: n-resize;
`;

const BottomScroller = styled.div`
  position: absolute;
  height: 0.25rem;
  left: 0;
  right: 0;
  bottom: 0rem;
  cursor: s-resize;
`;

export function Column({
  items,
  topMostPos,
  cursorPos,
  cursorStyle,
  columnDef,
  initialMaxItemsCount,
  onMaxItemsCountChange,
  selectItem,
  activateItem,
}: ColumnProps) {
  const { ref, height } = useResizeObserver<HTMLDivElement>({ round: (n) => n });
  const { height: glyphHeight } = useGlyphSize();
  const maxItemsCount = useMemo(() => (height ? Math.max(1, Math.trunc(height / Math.ceil(glyphHeight))) : undefined), [glyphHeight, height]);
  const [autoscroll, setAutoscroll] = useState(0);

  useEffect(() => {
    if (maxItemsCount) {
      onMaxItemsCountChange?.(maxItemsCount);
    }
  }, [maxItemsCount, onMaxItemsCountChange]);

  useEffect(() => {
    if (autoscroll === 0) return undefined;
    const timer = setInterval(() => selectItem?.(clamp(0, (cursorPos ?? 0) + autoscroll, items.length - 1)), 3);
    return () => clearInterval(timer);
  }, [autoscroll, items.length, selectItem, cursorPos]);

  const displayedItems = [];
  for (let i = topMostPos; i < Math.min(items.length, topMostPos + (maxItemsCount ?? initialMaxItemsCount)); i += 1) {
    displayedItems.push(items[i]);
  }

  const theme = useTheme();

  return (
    <Border {...theme.filePanel.column.border}>
      <ColumnRoot className="ColumnRoot" style={{ overflow: "hidden" }}>
        <ColumnHeader className="ColumnHeader">{columnDef.name}</ColumnHeader>
        <div
          ref={ref}
          style={{ overflow: "hidden" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            selectItem?.(topMostPos + displayedItems.length - 1);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            activateItem?.(topMostPos + displayedItems.length - 1, e.getModifierState("Shift"));
          }}
        >
          {displayedItems.map((item, idx) => (
            <Row
              key={item.name}
              cursorStyle={idx + topMostPos !== cursorPos ? "hidden" : cursorStyle}
              data={item}
              field={columnDef.field}
              onMouseOver={(e) => {
                if (e.buttons === 1) {
                  e.stopPropagation();
                  selectItem?.(idx + topMostPos);
                }
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                selectItem?.(idx + topMostPos);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                activateItem?.(idx + topMostPos, e.getModifierState("Shift"));
              }}
            />
          ))}
        </div>
        <TopScroller
          onMouseDown={(e) => {
            e.stopPropagation();
            window.addEventListener("mouseup", () => setAutoscroll(0), { once: true });
            setAutoscroll(-1);
          }}
        />
        <BottomScroller
          onMouseDown={(e) => {
            e.stopPropagation();
            window.addEventListener("mouseup", () => setAutoscroll(0), { once: true });
            setAutoscroll(1);
          }}
        />
      </ColumnRoot>
    </Border>
  );
}
