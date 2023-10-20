import { useElementSize } from "@hooks/useElementSize";
import Enumerable from "linq";
import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import styled from "styled-components";

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

const Root = styled.div`
  position: relative;
  overflow: hidden;
`;

const Fixed = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  column-gap: 0;
  column-fill: auto;
`;

const ScrollableRoot = styled.div`
  position: absolute;
  inset: 0;
  overflow-y: scroll;
  overscroll-behavior: none;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const ColumnBorders = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
`;
const ColumnBorder = styled.div`
  border-right: 1px solid ${(p) => p.theme.colors["panel.border"]};
  /* border-right-width: 0; */
  &:last-child {
    border-right-width: 0px;
  }
`;

const Scrollable = styled.div``;

function Borders({ columnCount }: { columnCount: number }) {
  return (
    <ColumnBorders>
      {Enumerable.repeat(0, columnCount).select((_, i) => (
        <ColumnBorder key={i} />
      ))}
    </ColumnBorders>
  );
}

export function ColumnsScroller({
  topmostItem,
  selectedItem,
  columnCount,
  totalCount,
  itemHeight,
  itemContent,
  onSelect,
  onMaxItemsPerColumnChanged,
}: ColumnsScrollerProps) {
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

  return (
    <Root ref={rootRef}>
      <Borders columnCount={columnCount} />
      <Fixed ref={fixedRef} style={{ columnCount }}>
        {/* BUG in Chrome (macOS)? When we use `e` as a key, the column layout works incorrectly without this hidden div */}
        {/* To reproduce: comment out the next line, navigate to a directory with big amount of files and use left-right keyboard arrows. */}
        <div style={{ height: 0.1, overflow: "hidden" }} />
        {Enumerable.range(topmostItem, Math.min(totalCount, itemsPerColumn * columnCount)).select((e) => (
          <div key={e} style={{ height: itemHeight }}>
            {itemContent(e)}
          </div>
        ))}
      </Fixed>
      <ScrollableRoot
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
        <Scrollable
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
          // onMouseDownCapture={handleMouseEvent}
          // onMouseMoveCapture={handleMouseEvent}
          // onMouseOutCapture={handleMouseEvent}
          // onMouseOverCapture={handleMouseEvent}
          // onMouseUpCapture={handleMouseEvent}
          // onClickCapture={handleMouseEvent}
          // onDoubleClickCapture={handleMouseEvent}
        />
      </ScrollableRoot>
    </Root>
  );
}
