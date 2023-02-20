import { forwardRef, useCallback, useEffect, useImperativeHandle, useReducer, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { Border } from "@components/Border/Border";
import { useCommandBindings, useExecuteBuiltInCommand } from "@hooks/useCommandBinding";
import { useCommandContext } from "@hooks/useCommandContext";
import { useFocused } from "@hooks/useFocused";
import { clamp } from "@utils/numberUtils";
import { Breadcrumb } from "../../Breadcrumb/Breadcrumb";
import { FileInfoFooter } from "./FileInfoFooter/FileInfoFooter";
import { ColumnDef, CursorStyle, FilePanelAction, PanelItem } from "./types";
import { CondensedView } from "./views/CondensedView/CondensedView";
import { FullView } from "./views/FullView/FullView";

type FullView = { type: "full"; columnDefs: ColumnDef[] };
type CondensedView = { type: "condensed"; columnDef: ColumnDef };

type FilePanelView = FullView | CondensedView;

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
  width: 100%;
  height: 100%;
  position: relative;
  color: ${(p) => p.theme.filePanel.color};
  background: ${(p) => p.theme.filePanel.bg};
  display: grid;
  overflow: hidden;
  outline: none;
  ${(p) => p.theme.filePanel.extension}
  user-select: none;
`;

const PanelContent = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto auto;
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
  const panelRootRef = useRef<HTMLDivElement>(null);
  const focused = useFocused(panelRootRef);
  useImperativeHandle(ref, () => ({ focus: () => panelRootRef.current?.focus() }));

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

  const executeBuiltInCommand = useExecuteBuiltInCommand();

  const onResize = useCallback((maxItemsPerColumn: number) => dispatch({ type: "resize", maxItemsPerColumn }), [dispatch]);
  const onItemClicked = useCallback((pos: number) => dispatch({ type: "moveCursorToPos", pos }), [dispatch]);
  const onItemActivated = useCallback(() => executeBuiltInCommand("open"), [executeBuiltInCommand]);
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
    <PanelRoot ref={panelRootRef} tabIndex={0} onFocus={() => onFocus?.()}>
      <Border {...theme.filePanel.border}>
        <PanelContent>
          <Breadcrumb backgroundColor={focused ? theme.filePanel.header.activeBg : theme.filePanel.header.inactiveBg}>
            {title
              ?.split("/")
              .filter((x) => x)
              .map((x, i) => (
                <Breadcrumb.Item key={i}>{x}</Breadcrumb.Item>
              ))}
          </Breadcrumb>
          {/* <PanelHeader active={focused}>{title}</PanelHeader> */}
          <PanelColumns
            onWheel={(e) => dispatch({ type: "scroll", delta: Math.sign(e.deltaY), followCursor: true })}
            onKeyDown={(e) => {
              dispatch({ type: "findFirst", char: e.key });
              e.preventDefault();
            }}
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
              <CondensedView
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
