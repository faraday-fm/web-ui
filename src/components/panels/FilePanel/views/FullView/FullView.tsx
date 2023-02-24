import styled from "styled-components";

import { ColumnDef, CursorStyle } from "../../types";
import { Column } from "../CondensedView/Column";

type FullViewProps = {
  items: { name: string }[];
  topMostPos: number;
  cursorPos: number;
  cursorStyle: CursorStyle;
  columnDefs: ColumnDef[];
  onMaxVisibleItemsChanged?: (count: number) => void;
  onItemClicked?: (pos: number) => void;
  onItemActivated?: (pos: number) => void;
};

const Columns = styled.div`
  display: grid;
  overflow: hidden;
  /* grid-auto-columns: 1fr;
grid-auto-flow: column; */
  /* grid-template-columns: 1fr auto; */
`;

export function FullView({ items, topMostPos, cursorPos, cursorStyle, columnDefs, onMaxVisibleItemsChanged, onItemClicked, onItemActivated }: FullViewProps) {
  const columns = new Array(columnDefs.length);

  const gridTemplateColumns = columnDefs.map((def) => def.width ?? "auto").join(" ");

  for (let i = 0; i < columnDefs.length; i += 1) {
    columns.push(
      <Column
        key={i}
        items={items}
        columnDef={columnDefs[i]}
        topMostPos={topMostPos}
        cursorPos={cursorPos}
        cursorStyle={cursorStyle}
        onMaxItemsCountChange={onMaxVisibleItemsChanged}
        selectItem={onItemClicked}
        activateItem={onItemActivated}
      />
    );
  }
  return <Columns style={{ gridTemplateColumns }}>{columns}</Columns>;
}
