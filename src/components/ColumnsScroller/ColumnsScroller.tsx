import { useElementSize } from "@hooks/useElementSize";
import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";

type ColumnsScrollerProps = {
  selectedItem: number;
  columnsCount: number;
  totalCount: number;
  itemHeight: number;
  itemContent(index: number): ReactNode;
  onScroll?: (scrollDelta: number) => void;
  onMaxItemsPerColumnChanged?: (count: number) => void;
};

const Root = styled.div`
  position: relative;
  overflow: hidden;
`;

const Fixed = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
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

const Scrollable = styled.div``;

type ColumnProps = {
  offsetY: number;
  viewportY: number;
  viewportHeight: number;
  totalCount: number;
  itemHeight: number;
  itemContent(index: number): ReactNode;
};

function Column({ offsetY, viewportY, viewportHeight, totalCount, itemHeight, itemContent }: ColumnProps) {
  const y = offsetY + viewportY;
  const fromIndex = Math.floor(y / itemHeight);
  const toIndex = Math.floor((y + viewportHeight) / itemHeight);
  const items = [];
  for (let i = fromIndex; i <= toIndex; i += 1) {
    items.push(
      <div key={i} style={{ position: "absolute", width: "100%", top: -viewportY + i * itemHeight, overflow: "hidden" }}>
        {itemContent(i)}
      </div>
    );
  }

  return <div style={{ position: "relative", transform: `translateY(-${offsetY}px)`, height: totalCount * itemHeight }}>{items}</div>;
}

export function ColumnsScroller({
  selectedItem,
  columnsCount,
  totalCount,
  itemHeight,
  itemContent,
  onScroll,
  onMaxItemsPerColumnChanged,
}: ColumnsScrollerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const { height } = useElementSize(rootRef);
  const itemsPerColumn = Math.floor(height / itemHeight);
  const [viewportY, setViewportY] = useState(0);

  const columns = new Array(columnsCount);
  for (let i = 0; i < columnsCount; i += 1) {
    columns.push(
      <Column
        key={i}
        offsetY={i * itemsPerColumn * itemHeight}
        viewportY={Math.floor(viewportY / itemHeight) * itemHeight}
        viewportHeight={height}
        itemContent={itemContent}
        itemHeight={itemHeight}
        totalCount={totalCount}
      />
    );
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

  useLayoutEffect(() => {
    const topIndex = Math.floor(viewportY / itemHeight);
    if (selectedItem < topIndex) {
      setViewportY(selectedItem * itemHeight);
    } else if (selectedItem > topIndex + columnsCount * itemsPerColumn - 1) {
      setViewportY((selectedItem - columnsCount * itemsPerColumn + 1) * itemHeight);
    } else if (viewportY > (totalCount - columnsCount * itemsPerColumn) * itemHeight) {
      setViewportY(Math.max(0, totalCount - columnsCount * itemsPerColumn) * itemHeight);
    }
  }, [columnsCount, itemHeight, itemsPerColumn, selectedItem, totalCount, viewportY]);

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
      <Fixed ref={fixedRef} style={{ height: itemsPerColumn * itemHeight }}>
        {columns}
      </Fixed>
      <ScrollableRoot
        ref={scrollableRef}
        style={{ height: itemsPerColumn * itemHeight }}
        onScroll={() => {
          if (!scrollableRef.current) {
            return;
          }
          const newSelectedItem = Math.round(scrollableRef.current.scrollTop / itemHeight);
          const scrollDelta = newSelectedItem - selectedItem;
          onScroll?.(scrollDelta);
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
