/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Border } from "@components/Border/Border";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import { useElementSize } from "@hooks/useElementSize";
import { clamp } from "@utils/numberUtils";
import { List } from "list";
import { useEffect, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";

import { ColumnDef, CursorStyle } from "../../types";
import { Row } from "./Row";

type ColumnProps = {
  items: List<{ name: string }>;
  cursorStyle: CursorStyle;
  topmostIndex: number;
  selectedIndex: number;
  columnDef: ColumnDef;
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

export function Column({ items, topmostIndex, selectedIndex, cursorStyle, columnDef, onMaxItemsCountChange, selectItem, activateItem }: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { height: glyphHeight } = useGlyphSize();
  const [autoscroll, setAutoscroll] = useState(0);
  const { height } = useElementSize(ref);

  const maxItemsCount = height ? Math.max(1, Math.trunc(height / glyphHeight)) : undefined;

  useEffect(() => {
    if (maxItemsCount) {
      onMaxItemsCountChange?.(maxItemsCount);
    }
  }, [maxItemsCount, onMaxItemsCountChange]);

  useEffect(() => {
    if (autoscroll === 0) return undefined;
    const timer = setInterval(() => selectItem?.(clamp(0, selectedIndex + autoscroll, items.length - 1)), 3);
    return () => clearInterval(timer);
  }, [autoscroll, items.length, selectItem, selectedIndex]);

  const displayedItems = items.slice(topmostIndex, Math.min(items.length, topmostIndex + (maxItemsCount ?? 0)));

  const theme = useTheme();

  let idx = 0;
  return (
    <Border {...theme.filePanel.column.border}>
      <ColumnRoot className="ColumnRoot" style={{ overflow: "hidden" }}>
        <ColumnHeader className="ColumnHeader">{columnDef.name}</ColumnHeader>
        <div
          ref={ref}
          style={{ overflow: "hidden" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            selectItem?.(topmostIndex + displayedItems.length - 1);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            activateItem?.(topmostIndex + displayedItems.length - 1, e.getModifierState("Shift"));
          }}
        >
          {maxItemsCount &&
            displayedItems.map((item) => {
              const localIdx = idx;
              const result = (
                <Row
                  key={item.name}
                  cursorStyle={localIdx + topmostIndex !== selectedIndex ? "hidden" : cursorStyle}
                  data={item}
                  field={columnDef.field}
                  onMouseOver={(e) => {
                    if (e.buttons === 1) {
                      e.stopPropagation();
                      selectItem?.(localIdx + topmostIndex);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    selectItem?.(localIdx + topmostIndex);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    activateItem?.(localIdx + topmostIndex, e.getModifierState("Shift"));
                  }}
                />
              );
              idx += 1;
              return result;
            })}
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
