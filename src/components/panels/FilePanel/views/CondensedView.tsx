import { memo, useCallback } from "react";
import { useGlyphSize } from "../../../../contexts/glyphSizeContext";
import type { FsEntry } from "../../../../features/fs/types";
import type { List } from "../../../../utils/immutableList";
import { Cell } from "../Cell";
import { ColumnsScroller } from "../ColumnsScroller";
import { FullFileName } from "../FullFileName";
import type { CursorStyle } from "../types";

interface CondensedViewProps {
  items: List<FsEntry>;
  cursorStyle: CursorStyle;
  topmostIndex: number;
  selectedIndex: number;
  columnCount: number;
  onMaxItemsPerColumnChanged?: (count: number) => void;
  onSelect: (topmost: number, selected: number) => void;
  onItemClicked?: (pos: number) => void;
  onItemActivated?: (pos: number) => void;
}

export const CondensedView = memo(function CondensedView({
  cursorStyle,
  items,
  topmostIndex,
  selectedIndex,
  columnCount,
  onMaxItemsPerColumnChanged,
  onSelect,
  onItemClicked,
  onItemActivated,
}: CondensedViewProps) {
  const { height: glyphHeight } = useGlyphSize();
  const rowHeight = Math.ceil(glyphHeight);

  const handleSelect = useCallback((topmost: number, scroll: number) => onSelect(topmost, scroll), [onSelect]);

  const itemContent = useCallback(
    (index: number) => (
      <Cell
        onMouseDown={() => onItemClicked?.(index)}
        onDoubleClick={(e) => {
          onItemActivated?.(index);
          e.stopPropagation();
          e.preventDefault();
        }}
        cursorStyle={index === selectedIndex && cursorStyle === "firm" ? "firm" : "hidden"}
      >
        <FullFileName cursorStyle={index === selectedIndex && cursorStyle === "firm" ? "firm" : "hidden"} data={items.get(index)} />
      </Cell>
    ),
    [cursorStyle, items, onItemActivated, onItemClicked, selectedIndex],
  );

  return (
    <ColumnsScroller
      topmostItem={topmostIndex}
      selectedItem={selectedIndex}
      columnCount={columnCount}
      itemContent={itemContent}
      totalCount={items.size()}
      itemHeight={rowHeight}
      onSelect={handleSelect}
      onMaxItemsPerColumnChanged={onMaxItemsPerColumnChanged}
    />
  );
});
