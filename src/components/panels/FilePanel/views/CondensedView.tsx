import { ColumnsScroller } from "@components/panels/FilePanel/ColumnsScroller";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import { FsEntry } from "@features/fs/types";
import { CursorPosition } from "@features/panels/types";
import { List } from "list";

import { Cell } from "../Cell";
import { FullFileName } from "../FullFileName";
import { CursorStyle } from "../types";

interface CondensedViewProps {
  items: List<FsEntry>;
  cursor: Required<CursorPosition>;
  cursorStyle: CursorStyle;
  columnCount: number;
  onMaxItemsPerColumnChanged?: (count: number) => void;
  onSelect: (topmost: number, selected: number) => void;
  onItemClicked?: (pos: number) => void;
  onItemActivated?: (pos: number) => void;
}

export function CondensedView({
  cursorStyle,
  items,
  cursor,
  columnCount,
  onMaxItemsPerColumnChanged,
  onSelect,
  onItemClicked,
  onItemActivated,
}: CondensedViewProps) {
  const { height: glyphHeight } = useGlyphSize();
  const rowHeight = Math.ceil(glyphHeight);

  return (
    <ColumnsScroller
      topmostItem={cursor.topmostIndex}
      selectedItem={cursor.selectedIndex}
      columnCount={columnCount}
      itemContent={(index) => (
        <Cell
          onMouseDown={() => onItemClicked?.(index)}
          onDoubleClick={(e) => {
            onItemActivated?.(index);
            e.stopPropagation();
            e.preventDefault();
          }}
          cursorStyle={index === cursor.selectedIndex && cursorStyle === "firm" ? "firm" : "hidden"}
        >
          <FullFileName cursorStyle={index === cursor.selectedIndex && cursorStyle === "firm" ? "firm" : "hidden"} data={items.nth(index)} />
        </Cell>
      )}
      totalCount={items.length}
      itemHeight={rowHeight}
      onSelect={(topmost, scroll) => onSelect(topmost, scroll)}
      onMaxItemsPerColumnChanged={onMaxItemsPerColumnChanged}
    />
  );
}
