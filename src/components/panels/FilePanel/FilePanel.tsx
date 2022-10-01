import { Border } from "~/src/components/Border/Border";
import { executeBuiltInCommand, useCommandBindings } from "~/src/hooks/useCommandBinding";
import { useCommandContext } from "~/src/hooks/useCommandContext";
import { useFocused } from "~/src/hooks/useFocused";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useReducer, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { clamp } from "~/src/utils/numberUtils";

import { FileInfoFooter } from "./FileInfoFooter/FileInfoFooter";
import { ColumnDef, CursorStyle, FilePanelAction, PanelItem } from "./types";
import { CondencedView } from "./views/CondencedView/CondencedView";
import { FullView } from "./views/FullView/FullView";

type FullView = { type: "full"; columnDefs: ColumnDef[] };
type CondencedView = { type: "condenced"; columnDef: ColumnDef };

type FilePanelView = FullView | CondencedView;

export type FilePanelProps = {
  items: PanelItem[];
  view: FilePanelView;
  title?: string;
  showCursorWhenBlurred?: boolean;
  onFocus?: () => void;
};

type FilePanelState = {
  originalItems: PanelItem[];
  panelItems: PanelItem[];
  topMostPos: number;
  cursorPos: number;
  columnsCount: number;
  maxItemsPerColumn: number;
  displayedItems: number;
};

function reducer(state: FilePanelState, action: FilePanelAction): FilePanelState {
  let { originalItems, panelItems, topMostPos, cursorPos, columnsCount, maxItemsPerColumn, displayedItems } = state;

  switch (action.type) {
    case "scroll":
      cursorPos += action.delta;
      if (action.followCursor) {
        topMostPos += action.delta;
      }
      break;
    case "moveCursorToPos":
      cursorPos = action.pos;
      break;
    case "moveCursorLeftRight":
      if (action.direction === "right") {
        cursorPos += maxItemsPerColumn;
        if (cursorPos >= topMostPos + displayedItems) {
          topMostPos += maxItemsPerColumn;
        }
      } else if (action.direction === "left") {
        cursorPos -= maxItemsPerColumn;
        if (cursorPos < topMostPos) {
          topMostPos -= maxItemsPerColumn;
        }
      }
      break;
    case "moveCursorPage":
      if (action.direction === "up") {
        cursorPos -= displayedItems - 1;
        topMostPos -= displayedItems - 1;
      } else if (action.direction === "down") {
        cursorPos += displayedItems - 1;
        topMostPos += displayedItems - 1;
      }
      break;
    case "resize":
      maxItemsPerColumn = action.maxItemsPerColumn;
      break;
    case "setItems":
      originalItems = action.items;
      panelItems = action.items;
      break;
    case "setColumnsCount":
      columnsCount = action.count;
      while (cursorPos >= topMostPos + action.count * maxItemsPerColumn) {
        topMostPos += maxItemsPerColumn;
      }
      break;
    case "findFirst":
      // panelItems = originalItems.filter((i) => i.name.startsWith(action.char));
      const idx = panelItems.slice(cursorPos).findIndex((i) => i.name.startsWith(action.char));
      if (idx >= 0) {
        cursorPos += idx;
      }
      break;
  }
  displayedItems = Math.min(panelItems.length, maxItemsPerColumn * columnsCount);
  cursorPos = clamp(0, cursorPos, panelItems.length - 1);
  topMostPos = clamp(0, topMostPos, panelItems.length - displayedItems);
  topMostPos = clamp(cursorPos - displayedItems + 1, topMostPos, cursorPos);

  // FIXME: Why do we need this check? See console log.
  if (
    state.originalItems === originalItems &&
    state.panelItems === panelItems &&
    state.topMostPos === topMostPos &&
    state.cursorPos === cursorPos &&
    state.columnsCount === columnsCount &&
    state.maxItemsPerColumn === maxItemsPerColumn &&
    state.displayedItems === displayedItems
  ) {
    return state;
  }
  return { originalItems, panelItems, topMostPos, cursorPos, columnsCount, maxItemsPerColumn, displayedItems };
}

export type FilePanelActions = {
  focus(): void;
};

const PanelRoot = styled.div`
  position: relative;
  color: ${(p) => p.theme.filePanel.color};
  background: ${(p) => p.theme.filePanel.bg};
  display: grid;
  overflow: hidden;
  ${(p) => p.theme.filePanel.extension}
`;

const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: ${(p) => p.theme.filePanel.content.margin};
`;

const PanelColumns = styled.div`
  display: grid;
  flex-shrink: 1;
  flex-grow: 1;
  overflow: hidden;
  &:focus {
    outline: none;
  }
`;

const PanelHeader = styled.div<{ active: boolean }>`
  color: ${(p) => (p.active ? p.theme.filePanel.header.activeColor : p.theme.filePanel.header.inactiveColor)};
  background-color: ${(p) => (p.active ? p.theme.filePanel.header.activeBg : p.theme.filePanel.header.inactiveBg)};
  ${(p) => p.theme.filePanel.header.extension}
`;

const PanelFooter = styled.div`
  color: ${(p) => p.theme.filePanel.footer.color};
  background-color: ${(p) => p.theme.filePanel.footer.bg};
  /* position: absolute; */
  /* bottom: 0;
  left: 50%;
  transform: translate(-50%, 0); */
  /* max-width: calc(100% - 2em); */
  /* z-index: 1; */
  padding: 0 0.25em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  ${(p) => p.theme.filePanel.footer.extension}
`;

const FileInfoPanel = styled.div`
  /* border: 1px solid var(--color-11);
  padding: calc(0.5rem - 1px) calc(0.25rem - 1px);
  color: var(--color-11); */
  overflow: hidden;
`;

export const FilePanel = forwardRef<FilePanelActions, FilePanelProps>(({ items, view, title, showCursorWhenBlurred, onFocus }, ref) => {
  const [state, dispatch] = useReducer(reducer, {
    originalItems: [] as PanelItem[],
    panelItems: [] as PanelItem[],
    topMostPos: 0,
    cursorPos: 0,
    columnsCount: 1,
    maxItemsPerColumn: 1,
    displayedItems: 0,
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const focused = useFocused(contentRef);
  useImperativeHandle(ref, () => ({ focus: () => contentRef.current?.focus() }));

  useEffect(() => {
    dispatch({ type: "setItems", items });
  }, [dispatch, items]);

  useEffect(() => {
    if (view.type === "full") {
      dispatch({ type: "setColumnsCount", count: 1 });
    }
  }, [dispatch, view]);

  useCommandContext("filePanel.focus", focused);
  useCommandContext({ "filePanel.firstItem": state.cursorPos === 0 }, focused);
  useCommandContext({ "filePanel.lastItem": state.cursorPos === state.panelItems.length - 1 }, focused);

  useCommandBindings(
    {
      cursorLeft: () => dispatch({ type: "moveCursorLeftRight", direction: "left" }),
      cursorRight: () => dispatch({ type: "moveCursorLeftRight", direction: "right" }),
      cursorUp: () => dispatch({ type: "scroll", delta: -1, followCursor: false }),
      cursorDown: () => dispatch({ type: "scroll", delta: 1, followCursor: false }),
      cursorStart: () => dispatch({ type: "moveCursorToPos", pos: 0 }),
      cursorEnd: () => dispatch({ type: "moveCursorToPos", pos: state.panelItems.length - 1 }),
      cursorPageUp: () => dispatch({ type: "moveCursorPage", direction: "up" }),
      cursorPageDown: () => dispatch({ type: "moveCursorPage", direction: "down" }),
    },
    focused
  );

  const onResize = useCallback((maxItemsPerColumn: number) => dispatch({ type: "resize", maxItemsPerColumn }), [dispatch]);
  const onItemClicked = useCallback((pos: number) => dispatch({ type: "moveCursorToPos", pos }), [dispatch]);
  const onItemActivated = useCallback(() => executeBuiltInCommand("open"), []);
  const onColumnsCountChanged = useCallback((count: number) => dispatch({ type: "setColumnsCount", count }), [dispatch]);

  let cursorStyle: CursorStyle;
  if (focused) {
    cursorStyle = "firm";
  } else if (showCursorWhenBlurred) {
    cursorStyle = "inactive";
  } else {
    cursorStyle = "hidden";
  }

  const theme = useTheme();

  return (
    <PanelRoot>
      <Border {...theme.filePanel.border}>
        <PanelContent>
          <PanelHeader active={focused}>{title}</PanelHeader>
          <PanelColumns
            ref={contentRef}
            onWheel={(e) => dispatch({ type: "scroll", delta: Math.sign(e.deltaY), followCursor: true })}
            tabIndex={0}
            onKeyDown={(e) => {
              dispatch({ type: "findFirst", char: e.key });
              e.preventDefault();
            }}
            onFocus={() => onFocus?.()}
          >
            {view.type === "full" ? (
              <FullView
                cursorStyle={cursorStyle}
                items={state.panelItems}
                topMostPos={state.topMostPos}
                cursorPos={state.cursorPos}
                initialMaxItemsCount={state.maxItemsPerColumn}
                onItemClicked={onItemClicked}
                onItemActivated={onItemActivated}
                onMaxVisibleItemsChanged={onResize}
                columnDefs={view.columnDefs}
              />
            ) : (
              <CondencedView
                cursorStyle={cursorStyle}
                items={state.panelItems}
                topMostPos={state.topMostPos}
                cursorPos={state.cursorPos}
                initialMaxItemsCount={state.maxItemsPerColumn}
                columnsCount={state.columnsCount}
                onItemClicked={onItemClicked}
                onItemActivated={onItemActivated}
                onMaxItemsPerColumnChanged={onResize}
                onColumnsCountChanged={onColumnsCountChanged}
                columnDef={view.columnDef}
              />
            )}
          </PanelColumns>
          <FileInfoPanel>
            <Border {...theme.filePanel.fileInfo.border}>
              <FileInfoFooter file={state.panelItems[state.cursorPos]} />
            </Border>
          </FileInfoPanel>
          <PanelFooter>321</PanelFooter>
        </PanelContent>
      </Border>
    </PanelRoot>
  );
});
