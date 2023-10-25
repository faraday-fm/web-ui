import { FsEntry } from "@features/fs/types";
import { CursorPosition } from "@features/panels";
import type { List } from "list";
import styled from "styled-components";
import { Column } from "../Column";
import { ColumnDef, CursorStyle } from "../types";

interface FullViewProps {
  items: List<FsEntry>;
  cursor: Required<CursorPosition>;
  cursorStyle: CursorStyle;
  columnDefs: ColumnDef[];
  onMaxVisibleItemsChanged?: (count: number) => void;
  onItemClicked?: (pos: number) => void;
  onItemActivated?: (pos: number) => void;
}

const Columns = styled.div`
  display: grid;
  overflow: hidden;
`;

export function FullView({ items, cursor, cursorStyle, columnDefs, onMaxVisibleItemsChanged, onItemClicked, onItemActivated }: FullViewProps) {
  const columns = new Array(columnDefs.length);

  const gridTemplateColumns = columnDefs.map((def) => def.width ?? "auto").join(" ");

  for (let i = 0; i < columnDefs.length; i += 1) {
    columns.push(
      <Column
        key={i}
        items={items}
        columnDef={columnDefs[i]}
        selectedIndex={cursor.selectedIndex}
        topmostIndex={cursor.topmostIndex}
        cursorStyle={cursorStyle}
        onMaxItemsCountChange={onMaxVisibleItemsChanged}
        selectItem={onItemClicked}
        activateItem={onItemActivated}
      />
    );
  }
  return <Columns style={{ gridTemplateColumns }}>{columns}</Columns>;
}
