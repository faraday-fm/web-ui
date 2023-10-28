/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ReactNode, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { css } from "../../../features/styles";
import { useElementSize } from "../../../hooks/useElementSize";

interface ColumnsScrollerProps {
  topmostItem: number;
  selectedItem: number;
  columnCount: number;
  totalCount: number;
  itemHeight: number;
  itemContent(index: number): ReactNode;
  onSelect: (newTopmostItem: number, newSelectedItem: number) => void;
  onMaxItemsPerColumnChanged?: (count: number) => void;
}

function Borders({ columnCount }: { columnCount: number }) {
  const borders = [];
  for (let i = 0; i < columnCount; i++) {
    borders.push(<div className={css("ColumnBorder")} key={i} />);
  }
  return <div className={css("ColumnBorders")}>{borders}</div>;
}

export const ColumnsScroller = memo(
  ({ topmostItem, selectedItem, columnCount, totalCount, itemHeight, itemContent, onSelect, onMaxItemsPerColumnChanged }: ColumnsScrollerProps) => {
    if (!Number.isInteger(itemHeight) || itemHeight <= 0) {
      throw new Error("itemHeight should be positive");
    }

    const rootRef = useRef<HTMLDivElement>(null);
    const fixedRef = useRef<HTMLDivElement>(null);
    const scrollableRef = useRef<HTMLDivElement>(null);
    const { height } = useElementSize(rootRef);
    let itemsPerColumn = Math.floor(height / itemHeight);
    if (itemsPerColumn < 1) {
      itemsPerColumn = 1;
    }
    useLayoutEffect(() => {
      onMaxItemsPerColumnChanged?.(itemsPerColumn);
    }, [itemsPerColumn, onMaxItemsPerColumnChanged]);

    useEffect(() => {
      if (!scrollableRef.current) {
        return;
      }
      if (Math.abs(scrollableRef.current.scrollTop - selectedItem * itemHeight) >= itemHeight) {
        scrollableRef.current.scrollTop = selectedItem * itemHeight;
      }
    }, [itemHeight, selectedItem]);

    if (selectedItem < topmostItem) {
      topmostItem = selectedItem;
    } else if (selectedItem > topmostItem + columnCount * itemsPerColumn - 1) {
      topmostItem = selectedItem - columnCount * itemsPerColumn + 1;
    } else if (topmostItem > totalCount - columnCount * itemsPerColumn) {
      topmostItem = Math.max(0, totalCount - columnCount * itemsPerColumn);
    }

    const handleMouseEvent = useCallback((e: React.MouseEvent) => {
      let targetEl: Element | undefined;
      for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
        if (fixedRef.current?.contains(el)) {
          targetEl = el;
          break;
        }
      }
      if (targetEl) {
        targetEl.dispatchEvent(new PointerEvent(e.type, e.nativeEvent));
      }
    }, []);

    const items = useMemo(() => {
      const res = [];
      for (let i = topmostItem; i < topmostItem + Math.min(totalCount, itemsPerColumn * columnCount); i++) {
        res.push(
          <div key={i} style={{ height: itemHeight }}>
            {itemContent(i)}
          </div>
        );
      }
      return res;
    }, [columnCount, itemContent, itemHeight, itemsPerColumn, topmostItem, totalCount]);

    return (
      <div className={css("ColumnsScrollerRoot")} ref={rootRef}>
        <Borders columnCount={columnCount} />
        <div className={css("ColumnsScrollerFixed")} ref={fixedRef} style={{ columnCount }}>
          {/* BUG in Chrome (macOS)? When we use `e` as a key, the column layout works incorrectly without this hidden div */}
          {/* To reproduce: comment out the next line, navigate to a directory with big amount of files and use left-right keyboard arrows. */}
          <div style={{ height: 0.1, overflow: "hidden" }} />
          {items}
        </div>
        <div
          className={css("ScrollableRoot")}
          ref={scrollableRef}
          style={{ height: itemsPerColumn * itemHeight }}
          onScroll={() => {
            if (!scrollableRef.current) {
              return;
            }
            const newSelectedItem = Math.round(scrollableRef.current.scrollTop / itemHeight);
            const delta = newSelectedItem - selectedItem;
            if (delta) {
              onSelect?.(topmostItem + delta, newSelectedItem);
            }
          }}
        >
          <div
            style={{ height: `calc(100% + ${(totalCount - 1) * itemHeight}px)` }}
            onMouseDown={handleMouseEvent}
            onMouseEnter={handleMouseEvent}
            onMouseLeave={handleMouseEvent}
            onMouseMove={handleMouseEvent}
            onMouseOut={handleMouseEvent}
            onMouseOver={handleMouseEvent}
            onMouseUp={handleMouseEvent}
            onClick={handleMouseEvent}
            onDoubleClick={handleMouseEvent}
          />
        </div>
      </div>
    );
  }
);
ColumnsScroller.displayName = "ColumnsScroller";
