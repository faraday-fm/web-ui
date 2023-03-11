/* eslint-disable react/no-unstable-nested-components */
import { ColumnsScroller } from "@components/ColumnsScroller/ColumnsScroller";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import { FsEntry } from "@features/fs/types";
import { CursorPosition } from "@features/panels/panelsSlice";
import { List } from "list";

import { ColumnDef, CursorStyle } from "../../types";
import { Cell } from "./Cell";

type CondensedViewProps = {
  items: List<FsEntry>;
  cursor: Required<CursorPosition>;
  cursorStyle: CursorStyle;
  columnsCount: number;
  columnDef: ColumnDef;
  onMaxItemsPerColumnChanged?: (count: number) => void;
  onScroll?: (delta: number) => void;
  onItemClicked?: (pos: number) => void;
  onItemActivated?: (pos: number) => void;
};

export function CondensedView({
  cursorStyle,
  items,
  cursor,
  columnsCount,
  columnDef,
  onMaxItemsPerColumnChanged,
  onScroll,
  onItemClicked,
  onItemActivated,
}: CondensedViewProps) {
  const { height: glyphHeight } = useGlyphSize();
  const rowHeight = Math.ceil(glyphHeight);

  return (
    <ColumnsScroller
      selectedItem={cursor.selectedIndex}
      columnsCount={columnsCount}
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
      onScroll={(scrollDelta) => onScroll?.(scrollDelta)}
      onMaxItemsPerColumnChanged={onMaxItemsPerColumnChanged}
    />
  );
}
