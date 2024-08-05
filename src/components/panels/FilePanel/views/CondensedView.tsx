import { memo, useCallback, useRef } from "react";
import { useGlyphSize } from "../../../../contexts/glyphSizeContext";
import type { List } from "../../../../utils/immutableList";
import { Cell } from "../Cell";
import { ColumnsScroller, type ColumnsScrollerProps } from "../ColumnsScroller";
import { FullFileName } from "../FullFileName";
import type { CursorStyle } from "../types";
import type { Dirent } from "../../../../features/fs/types";

interface CondensedViewProps {
  items: List<Dirent>;
  selectedItemNames: List<string>;
  cursorStyle: CursorStyle;
  topmostIndex: number;
  selectedIndex: number;
  columnCount: number;
  onMaxItemsPerColumnChanged?: (count: number) => void;
  onPosChange: (topmost: number, active: number) => void;
  onItemClicked?: (pos: number) => void;
  onItemActivated?: (pos: number) => void;
}

export const CondensedView = memo(function CondensedView({
  cursorStyle,
  items,
  selectedItemNames,
  topmostIndex,
  selectedIndex,
  columnCount,
  onMaxItemsPerColumnChanged,
  onPosChange,
  onItemClicked,
  onItemActivated,
}: CondensedViewProps) {
  const { height: glyphHeight } = useGlyphSize();
  const rowHeight = Math.ceil(glyphHeight);
  const selectedNames = selectedItemNames.toSet();

  const handlePosChange: ColumnsScrollerProps["onPosChange"] = useCallback((topmost, active) => onPosChange(topmost, active), [onPosChange]);

  const itemContent = useCallback(
    (index: number) => (
      <Cell
        selected={selectedNames.has(items.get(index)?.filename ?? "")}
        onMouseDown={() => onItemClicked?.(index)}
        onDoubleClick={(e) => {
          onItemActivated?.(index);
          e.stopPropagation();
          e.preventDefault();
        }}
        cursorStyle={index === selectedIndex && cursorStyle === "firm" ? "firm" : "hidden"}
      >
        <FullFileName cursorStyle={index === selectedIndex && cursorStyle === "firm" ? "firm" : "hidden"} dirent={items.get(index)} />
      </Cell>
    ),
    [cursorStyle, items, selectedNames, onItemActivated, onItemClicked, selectedIndex],
  );

  return (
    <ColumnsScroller
      topmostIndex={topmostIndex}
      activeIndex={selectedIndex}
      columnCount={columnCount}
      renderItem={itemContent}
      totalCount={items.size()}
      itemHeight={rowHeight}
      onPosChange={handlePosChange}
      onMaxItemsPerColumnChanged={onMaxItemsPerColumnChanged}
    />
  );
});
