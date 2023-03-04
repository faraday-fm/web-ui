import { FsEntry } from "@features/fs/types";
import { CursorPosition } from "@features/panels/panelsSlice";
import { List } from "list";
import { useCallback, useState } from "react";
import styled from "styled-components";

import { ColumnDef, CursorStyle } from "../../types";
import { Column } from "./Column";

type CondensedViewProps = {
  items: List<FsEntry>;
  cursor: Required<CursorPosition>;
  cursorStyle: CursorStyle;
  columnsCount: number;
  columnDef: ColumnDef;
  onMaxItemsPerColumnChanged?: (count: number) => void;
  onItemClicked?: (pos: number) => void;
  onItemActivated?: (pos: number) => void;
};

const Columns = styled.div`
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  overflow: hidden;
`;

export function CondensedView({
  cursorStyle,
  items,
  cursor,
  columnsCount,
  columnDef,
  onMaxItemsPerColumnChanged,
  onItemClicked,
  onItemActivated,
}: CondensedViewProps) {
  const [maxItemsPerColumn, setMaxItemsPerColumn] = useState(1000);

  const columns = new Array(columnsCount);

  const onMaxItemsCountChange = useCallback(
    (maxCount: number) => {
      setMaxItemsPerColumn(maxCount);
      onMaxItemsPerColumnChanged?.(maxCount);
    },
    [onMaxItemsPerColumnChanged]
  );

  for (let i = 0; i < columnsCount; i += 1) {
    columns.push(
      <Column
        key={i}
        items={items}
        columnDef={columnDef}
        topmostIndex={cursor.topmostIndex + i * maxItemsPerColumn}
        selectedIndex={cursor.selectedIndex}
        cursorStyle={cursorStyle}
        onMaxItemsCountChange={i === 0 ? onMaxItemsCountChange : undefined}
        selectItem={onItemClicked}
        activateItem={onItemActivated}
      />
    );
  }
  return <Columns>{columns}</Columns>;
}
