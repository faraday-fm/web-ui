import { useEffect, useState } from "react";
import styled from "styled-components";
import useResizeObserver from "use-resize-observer";

import { ColumnDef, CursorStyle } from "../../types";
import { Column } from "./Column";

type CondencedViewProps = {
  items: any;
  topMostPos: number;
  cursorPos: number;
  cursorStyle: CursorStyle;
  columnsCount: number;
  columnDef: ColumnDef;
  initialMaxItemsCount: number;
  onMaxItemsPerColumnChanged?: (count: number) => void;
  onColumnsCountChanged?: (count: number) => void;
  onItemClicked?: (pos: number) => void;
  onItemActivated?: (pos: number) => void;
};

const Columns = styled.div`
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  overflow: hidden;
`;

export function CondencedView({
  cursorStyle,
  items,
  topMostPos,
  cursorPos,
  columnsCount,
  columnDef,
  initialMaxItemsCount,
  onMaxItemsPerColumnChanged,
  onColumnsCountChanged,
  onItemClicked,
  onItemActivated,
}: CondencedViewProps) {
  const [maxItemsPerColumn, setMaxItemsPerColumn] = useState(1);
  const { ref, width = 1 } = useResizeObserver();

  useEffect(() => {
    onColumnsCountChanged?.(Math.ceil(width / 350));
  }, [onColumnsCountChanged, width]);

  const columns = new Array(columnsCount);

  for (let i = 0; i < columnsCount; i += 1) {
    columns.push(
      <Column
        key={i}
        items={items}
        columnDef={columnDef}
        initialMaxItemsCount={initialMaxItemsCount}
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
  return <Columns ref={ref}>{columns}</Columns>;
}
