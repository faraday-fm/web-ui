/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Border } from "@components/Border";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import { useElementSize } from "@hooks/useElementSize";
import { clamp } from "@utils/number";
import { List } from "list";
import { useEffect, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";

import { Cell } from "./Cell";
import { CellText } from "./CellText";
import { FullFileName } from "./FullFileName";
import { ColumnDef, CursorStyle } from "./types";

type ColumnProps = {
  items: List<Record<string, unknown> & { name: string }>;
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
  text-align: left;
  box-sizing: border-box;
  padding-top: calc(0.5rem - 1px);
`;
const ColumnHeader = styled.div`
  text-align: center;
  color: ${(p) => p.theme.colors["panel.header.foreground"]};
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
  const lastClickTime = useRef(0);
  const theme = useTheme();

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

  let idx = 0;
  return (
    <Border $color={theme.colors["panel.border"]}>
      <ColumnRoot className="ColumnRoot" style={{ overflow: "hidden" }}>
        <ColumnHeader className="ColumnHeader">{columnDef.name}</ColumnHeader>
        <div
          ref={ref}
          style={{ overflow: "hidden" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (Date.now() - lastClickTime.current < 200) {
              activateItem?.(topmostIndex + displayedItems.length - 1, e.getModifierState("Shift"));
              lastClickTime.current = 0;
            } else {
              selectItem?.(topmostIndex + displayedItems.length - 1);
              lastClickTime.current = Date.now();
            }
          }}
        >
          {maxItemsCount &&
            displayedItems.map((item) => {
              const localIdx = idx;
              const result = (
                <Cell
                  key={item.name}
                  cursorStyle={localIdx + topmostIndex !== selectedIndex ? "hidden" : cursorStyle}
                  onMouseOver={(e) => {
                    if (e.buttons === 1) {
                      e.stopPropagation();
                      selectItem?.(localIdx + topmostIndex);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (Date.now() - lastClickTime.current < 200) {
                      activateItem?.(localIdx + topmostIndex, e.getModifierState("Shift"));
                      lastClickTime.current = 0;
                    } else {
                      selectItem?.(localIdx + topmostIndex);
                      lastClickTime.current = Date.now();
                    }
                  }}
                >
                  {columnDef.field === "name" ? (
                    <FullFileName data={item} cursorStyle={cursorStyle} />
                  ) : (
                    <CellText text={item[columnDef.field]} cursorStyle={cursorStyle} />
                  )}
                </Cell>
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
