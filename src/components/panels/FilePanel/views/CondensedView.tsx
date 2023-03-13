/* eslint-disable react/no-unstable-nested-components */
import { ColumnsScroller } from "@components/panels/FilePanel/ColumnsScroller";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import { FsEntry } from "@features/fs/types";
import { CursorPosition } from "@features/panels/panelsSlice";
import { List } from "list";

import { Cell } from "../Cell";
import { ColumnDef, CursorStyle } from "../types";

type CondensedViewProps = {
  items: List<FsEntry>;
  cursor: Required<CursorPosition>;
  cursorStyle: CursorStyle;
  columnCount: number;
  columnDef: ColumnDef;
  onMaxItemsPerColumnChanged?: (count: number) => void;
  onSelect: (topmost: number, selected: number) => void;
  onItemClicked?: (pos: number) => void;
  onItemActivated?: (pos: number) => void;
};

export function CondensedView({
  cursorStyle,
  items,
  cursor,
  columnCount,
  columnDef,
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
          cursorStyle={index === cursor.selectedIndex && cursorStyle === "firm" ? "firm" : "hidden"}
          data={items.nth(index)}
          onMouseDown={() => onItemClicked?.(index)}
          onDoubleClick={(e) => {
            onItemActivated?.(index);
            e.stopPropagation();
            e.preventDefault();
          }}
          field={columnDef.field}
        />
      )}
      totalCount={items.length}
      itemHeight={rowHeight}
      onSelect={(topmost, scroll) => onSelect(topmost, scroll)}
      onMaxItemsPerColumnChanged={onMaxItemsPerColumnChanged}
    />
  );
}
