import { type ReactNode, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { css } from "../../../features/styles";
import { useElementSize } from "../../../hooks/useElementSize";
import ScrollableContainer from "./ScrollableContainer";

export interface ColumnsScrollerProps {
  topmostIndex: number;
  activeIndex: number;
  columnCount: number;
  totalCount: number;
  itemHeight: number;
  renderItem(index: number): ReactNode;
  onPosChange: (newTopmostItem: number, newActiveItem: number) => void;
  onMaxItemsPerColumnChanged?: (count: number) => void;
}

function Borders({ columnCount }: { columnCount: number }) {
  const borders = [];
  for (let i = 0; i < columnCount; i++) {
    borders.push(<div className={css("column-border")} key={i} />);
  }
  return <div className={css("column-borders")}>{borders}</div>;
}

export const ColumnsScroller = memo((props: ColumnsScrollerProps) => {
  let { topmostIndex, activeIndex, columnCount, totalCount, itemHeight, renderItem, onPosChange, onMaxItemsPerColumnChanged } = props;

  if (!Number.isInteger(itemHeight) || itemHeight <= 0) {
    throw new Error("itemHeight should be positive");
  }

  const onPosChangeRef = useRef(onPosChange);
  const onMaxItemsPerColumnChangedRef = useRef(onMaxItemsPerColumnChanged);
  onPosChangeRef.current = onPosChange;
  onMaxItemsPerColumnChangedRef.current = onMaxItemsPerColumnChanged;

  const rootRef = useRef<HTMLDivElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);
  const { height } = useElementSize(rootRef);
  const itemsPerColumn = Math.max(1, Math.floor(height / itemHeight));

  useLayoutEffect(() => {
    onMaxItemsPerColumnChangedRef.current?.(itemsPerColumn);
  }, [itemsPerColumn]);

  if (activeIndex < topmostIndex) {
    topmostIndex = activeIndex;
  } else if (activeIndex > topmostIndex + columnCount * itemsPerColumn - 1) {
    topmostIndex = activeIndex - columnCount * itemsPerColumn + 1;
  } else if (topmostIndex > totalCount - columnCount * itemsPerColumn) {
    topmostIndex = Math.max(0, totalCount - columnCount * itemsPerColumn);
  }

  const topmostIndexRef = useRef(topmostIndex);
  const activeIndexRef = useRef(activeIndex);
  topmostIndexRef.current = topmostIndex;
  activeIndexRef.current = activeIndex;

  const items = useMemo(() => {
    const itemsSlice = [];
    for (let i = topmostIndex; i < topmostIndex + Math.min(totalCount, itemsPerColumn * columnCount); i++) {
      itemsSlice.push(
        <div key={i} style={{ height: itemHeight }}>
          {renderItem(i)}
        </div>,
      );
    }
    return itemsSlice;
  }, [columnCount, renderItem, itemHeight, itemsPerColumn, topmostIndex, totalCount]);

  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    setScrollTop(activeIndex * itemHeight);
  }, [itemHeight, activeIndex]);

  const onScroll = useCallback(
    (scroll: number) => {
      setScrollTop(scroll);
      const newActiveItem = Math.round(scroll / itemHeight);
      const delta = newActiveItem - activeIndexRef.current;
      if (delta) {
        onPosChangeRef.current?.(topmostIndexRef.current + delta, newActiveItem);
      }
    },
    [itemHeight],
  );

  return (
    <div className={css("columns-scroller-root")} ref={rootRef}>
      <Borders columnCount={columnCount} />

      <ScrollableContainer
        scrollTop={scrollTop}
        scrollHeight={(totalCount - 1) * itemHeight}
        style={{ height: "100%" }}
        innerContainerStyle={{ width: "100%", height: "100%" }}
        onScroll={onScroll}
      >
        <div className={css("columns-scroller-fixed")} ref={fixedRef} style={{ columnCount }}>
          {/* BUG in Chrome (macOS)? When we use `e` as a key, the column layout works incorrectly without this hidden div */}
          {/* To reproduce: comment out the next line, navigate to a directory with big amount of files and use left-right keyboard arrows. */}
          <div style={{ height: 0.1, overflow: "hidden" }} />
          {items}
        </div>
      </ScrollableContainer>
    </div>
  );
});
