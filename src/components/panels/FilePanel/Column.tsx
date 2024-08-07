/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useEffect, useRef, useState } from "react";
import { useGlyphSize } from "../../../contexts/glyphSizeContext";
import { css } from "../../../features/styles";
import { useElementSize } from "../../../hooks/useElementSize";
import type { List } from "../../../utils/immutableList";
import { clamp } from "../../../utils/number";
import { Border } from "../../Border";
import { Cell } from "./Cell";
import { CellText } from "./CellText";
import { FullFileName } from "./FullFileName";
import type { ColumnDef, CursorStyle } from "./types";

interface ColumnProps {
  items: List<Record<string, unknown> & { name: string }>;
  cursorStyle: CursorStyle;
  topmostIndex: number;
  selectedIndex: number;
  columnDef: ColumnDef;
  onMaxItemsCountChange?: (maxCount: number) => void;
  selectItem?: (position: number) => void;
  activateItem?: (position: number, shiftModifier: boolean) => void;
}

export function Column({ items, topmostIndex, selectedIndex, cursorStyle, columnDef, onMaxItemsCountChange, selectItem, activateItem }: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { height: glyphHeight } = useGlyphSize();
  const [autoscroll, setAutoscroll] = useState(0);
  const { height } = useElementSize(ref);
  const lastClickTime = useRef(0);

  const maxItemsCount = height ? Math.max(1, Math.trunc(height / glyphHeight)) : undefined;

  useEffect(() => {
    if (maxItemsCount) {
      onMaxItemsCountChange?.(maxItemsCount);
    }
  }, [maxItemsCount, onMaxItemsCountChange]);

  useEffect(() => {
    if (autoscroll === 0) return undefined;
    const timer = setInterval(() => selectItem?.(clamp(0, selectedIndex + autoscroll, items.size() - 1)), 3);
    return () => clearInterval(timer);
  }, [autoscroll, items, selectItem, selectedIndex]);

  const displayedItems = items.slice(topmostIndex, Math.min(items.size(), topmostIndex + (maxItemsCount ?? 0)));

  let idx = 0;
  return (
    <Border color="panel-border">
      <div className={css("column-root")} style={{ overflow: "hidden" }}>
        <div className={css("column-header")}>{columnDef.name}</div>
        <div
          ref={ref}
          style={{ overflow: "hidden" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (Date.now() - lastClickTime.current < 200) {
              activateItem?.(topmostIndex + displayedItems.size() - 1, e.getModifierState("Shift"));
              lastClickTime.current = 0;
            } else {
              selectItem?.(topmostIndex + displayedItems.size() - 1);
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
                    <FullFileName dirent={item} cursorStyle={cursorStyle} />
                  ) : (
                    <CellText text={item[columnDef.field]} cursorStyle={cursorStyle} />
                  )}
                </Cell>
              );
              idx += 1;
              return result;
            })}
        </div>
        <div
          className={css("top-scroller")}
          onMouseDown={(e) => {
            e.stopPropagation();
            window.addEventListener("mouseup", () => setAutoscroll(0), {
              once: true,
            });
            setAutoscroll(-1);
          }}
        />
        <div
          className={css("bottom-scroller")}
          onMouseDown={(e) => {
            e.stopPropagation();
            window.addEventListener("mouseup", () => setAutoscroll(0), {
              once: true,
            });
            setAutoscroll(1);
          }}
        />
      </div>
    </Border>
  );
}
