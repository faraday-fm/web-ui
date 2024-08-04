import { type ReactNode, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { css } from "../../../features/styles";
import { useElementSize } from "../../../hooks/useElementSize";
import ScrollableContainer from "./ScrollableContainer";

interface ColumnsScrollerProps {
  topmostItem: number;
  activeItem: number;
  columnCount: number;
  totalCount: number;
  itemHeight: number;
  itemContent(index: number): ReactNode;
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

export const ColumnsScroller = memo(
  ({ topmostItem, activeItem, columnCount, totalCount, itemHeight, itemContent, onPosChange, onMaxItemsPerColumnChanged }: ColumnsScrollerProps) => {
    if (!Number.isInteger(itemHeight) || itemHeight <= 0) {
      throw new Error("itemHeight should be positive");
    }

    const rootRef = useRef<HTMLDivElement>(null);
    const fixedRef = useRef<HTMLDivElement>(null);
    // const scrollableRef = useRef<HTMLDivElement>(null);
    const { height } = useElementSize(rootRef);
    let itemsPerColumn = Math.floor(height / itemHeight);
    if (itemsPerColumn < 1) {
      itemsPerColumn = 1;
    }
    useLayoutEffect(() => {
      onMaxItemsPerColumnChanged?.(itemsPerColumn);
    }, [itemsPerColumn, onMaxItemsPerColumnChanged]);

    if (activeItem < topmostItem) {
      topmostItem = activeItem;
    } else if (activeItem > topmostItem + columnCount * itemsPerColumn - 1) {
      topmostItem = activeItem - columnCount * itemsPerColumn + 1;
    } else if (topmostItem > totalCount - columnCount * itemsPerColumn) {
      topmostItem = Math.max(0, totalCount - columnCount * itemsPerColumn);
    }

    const items = useMemo(() => {
      const res = [];
      for (let i = topmostItem; i < topmostItem + Math.min(totalCount, itemsPerColumn * columnCount); i++) {
        res.push(
          <div key={i} style={{ height: itemHeight }}>
            {itemContent(i)}
          </div>,
        );
      }
      return res;
    }, [columnCount, itemContent, itemHeight, itemsPerColumn, topmostItem, totalCount]);

    const [scrollTop, setScrollTop] = useState(0);

    useEffect(() => {
      setScrollTop(activeItem * itemHeight);
    }, [itemHeight, activeItem]);

    const activeItemRef = useRef(activeItem);
    const topmostItemRef = useRef(topmostItem);
    activeItemRef.current = activeItem;
    topmostItemRef.current = topmostItem;

    const onScroll = useCallback(
      (scroll: number) => {
        // console.info(scroll);
        setScrollTop(scroll);
        const newActiveItem = Math.round(scroll / itemHeight);
        const delta = newActiveItem - activeItemRef.current;
        if (delta) {
          onPosChange?.(topmostItemRef.current + delta, newActiveItem);
        }
      },
      [itemHeight, onPosChange],
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
  },
);
