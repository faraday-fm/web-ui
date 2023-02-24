import { useState } from "react";
import styled from "styled-components";

import { ColumnDef, CursorStyle } from "../../types";
import { Column } from "./Column";

type CondensedViewProps = {
  items: any;
  topMostPos: number;
  cursorPos: number;
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
  topMostPos,
  cursorPos,
  columnsCount,
  columnDef,
  onMaxItemsPerColumnChanged,
  onItemClicked,
  onItemActivated,
}: CondensedViewProps) {
  const [maxItemsPerColumn, setMaxItemsPerColumn] = useState(1000);

  const columns = new Array(columnsCount);

  for (let i = 0; i < columnsCount; i += 1) {
    columns.push(
      <Column
        key={i}
        items={items}
        columnDef={columnDef}
        topMostPos={topMostPos + i * maxItemsPerColumn}
        cursorPos={cursorPos}
        cursorStyle={cursorStyle}
        onMaxItemsCountChange={(maxCount) => {
          if (i === 0) {
            setMaxItemsPerColumn(maxCount);
            onMaxItemsPerColumnChanged?.(maxCount);
          }
        }}
        selectItem={onItemClicked}
        activateItem={onItemActivated}
      />
    );
  }
  return <Columns>{columns}</Columns>;
}
