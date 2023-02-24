import { Border } from "@components/Border/Border";
import { useCommandBindings, useExecuteBuiltInCommand } from "@hooks/useCommandBinding";
import { useCommandContext } from "@hooks/useCommandContext";
import { useFocused } from "@hooks/useFocused";
import { FilePanelView } from "@types";
import { clamp } from "@utils/numberUtils";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";

import { Breadcrumb } from "../../Breadcrumb/Breadcrumb";
import { FileInfoFooter } from "./FileInfoFooter/FileInfoFooter";
import { CursorStyle, PanelItem } from "./types";
import { CondensedView } from "./views/CondensedView/CondensedView";
import { FullView } from "./views/FullView/FullView";

export type FilePanelProps = {
  items: PanelItem[];
  topMostPos: number;
  cursorPos: number;
  view: FilePanelView;
  title?: string;
  showCursorWhenBlurred?: boolean;
  onFocus?: () => void;
  onCursorPositionChange: (newTopMostPos: number, newCursorPos: number) => void;
};

// type FilePanelState = {
//   panelItems: PanelItem[];
//   topMostPos: number;
//   cursorPos: number;
//   columnsCount: number;
//   maxItemsPerColumn: number;
//   displayedItems: number;
// };

// function reducer(state: FilePanelState, action: FilePanelAction): FilePanelState {
//   let { panelItems, topMostPos, cursorPos, columnsCount, maxItemsPerColumn, displayedItems } = state;

//   switch (action.type) {
//     case "scroll":
//       cursorPos += action.delta;
//       if (action.followCursor) {
//         topMostPos += action.delta;
//       }
//       break;
//     case "moveCursorToPos":
//       cursorPos = action.pos;
//       break;
//     case "moveCursorLeftRight":
//       if (action.direction === "right") {
//         cursorPos += maxItemsPerColumn;
//         if (cursorPos >= topMostPos + displayedItems) {
//           topMostPos += maxItemsPerColumn;
//         }
//       } else if (action.direction === "left") {
//         cursorPos -= maxItemsPerColumn;
//         if (cursorPos < topMostPos) {
//           topMostPos -= maxItemsPerColumn;
//         }
//       }
//       break;
//     case "moveCursorPage":
//       if (action.direction === "up") {
//         cursorPos -= displayedItems - 1;
//         topMostPos -= displayedItems - 1;
//       } else if (action.direction === "down") {
//         cursorPos += displayedItems - 1;
//         topMostPos += displayedItems - 1;
//       }
//       break;
//     case "resize":
//       maxItemsPerColumn = action.maxItemsPerColumn;
//       break;
//     case "setItems":
//       panelItems = action.items;
//       // originalItems = Array.from(action.items);
//       // panelItems = Array.from(originalItems).sort((a, b) => collator.compare(a.name, b.name));
//       break;
//     case "setColumnsCount":
//       columnsCount = action.count;
//       while (cursorPos >= topMostPos + action.count * maxItemsPerColumn) {
//         topMostPos += maxItemsPerColumn;
//       }
//       break;
//     case "findFirst":
//       // panelItems = originalItems.filter((i) => i.name.startsWith(action.char));
//       const idx = panelItems.slice(cursorPos).findIndex((i) => i.name.startsWith(action.char));
//       if (idx >= 0) {
//         cursorPos += idx;
//       }
//       break;
//   }
//   displayedItems = Math.min(panelItems.length, maxItemsPerColumn * columnsCount);
//   cursorPos = clamp(0, cursorPos, panelItems.length - 1);
//   topMostPos = clamp(0, topMostPos, panelItems.length - displayedItems);
//   topMostPos = clamp(cursorPos - displayedItems + 1, topMostPos, cursorPos);

//   // FIXME: Why do we need this check? See console log.
//   if (
//     state.panelItems === panelItems &&
//     state.topMostPos === topMostPos &&
//     state.cursorPos === cursorPos &&
//     state.columnsCount === columnsCount &&
//     state.maxItemsPerColumn === maxItemsPerColumn &&
//     state.displayedItems === displayedItems
//   ) {
//     return state;
//   }
//   return { panelItems, topMostPos, cursorPos, columnsCount, maxItemsPerColumn, displayedItems };
// }

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

export const FilePanel = forwardRef<FilePanelActions, FilePanelProps>(
  ({ items, topMostPos, cursorPos, view, title, showCursorWhenBlurred, onFocus, onCursorPositionChange }, ref) => {
    const [maxItemsPerColumn, setMaxItemsPerColumn] = useState<number>();
    const columnsCount = view.type === "full" ? 1 : view.columnsCount;

    const displayedItems = maxItemsPerColumn ? Math.min(items.length, maxItemsPerColumn * columnsCount) : 1;

    function clampPos() {
      cursorPos = clamp(0, cursorPos, items.length - 1);
      topMostPos = clamp(0, topMostPos, items.length - displayedItems);
      topMostPos = clamp(cursorPos - displayedItems + 1, topMostPos, cursorPos);
    }

    clampPos();

    const panelRootRef = useRef<HTMLDivElement>(null);
    const focused = useFocused(panelRootRef);
    useImperativeHandle(ref, () => ({
      focus: () => panelRootRef.current?.focus(),
    }));

    useCommandContext("filePanel.focus", focused);
    useCommandContext({ "filePanel.firstItem": cursorPos === 0 }, focused);
    useCommandContext({ "filePanel.lastItem": cursorPos === items.length - 1 }, focused);

    function moveCursorLeftRight(direction: "left" | "right") {
      if (direction === "right") {
        cursorPos += maxItemsPerColumn ?? 0;
        if (cursorPos >= topMostPos + displayedItems) {
          topMostPos += maxItemsPerColumn ?? 0;
        }
      } else if (direction === "left") {
        cursorPos -= maxItemsPerColumn ?? 0;
        if (cursorPos < topMostPos) {
          topMostPos -= maxItemsPerColumn ?? 0;
        }
      }
      clampPos();
      onCursorPositionChange(topMostPos, cursorPos);
    }

    function scroll(delta: number, followCursor: boolean) {
      cursorPos += delta;
      if (followCursor) {
        topMostPos += delta;
      }
      clampPos();
      onCursorPositionChange(topMostPos, cursorPos);
    }

    function moveCursorToPos(pos: number) {
      cursorPos = pos;
      clampPos();
      onCursorPositionChange(topMostPos, cursorPos);
    }

    function moveCursorPage(direction: "up" | "down") {
      if (direction === "up") {
        cursorPos -= displayedItems - 1;
        topMostPos -= displayedItems - 1;
      } else if (direction === "down") {
        cursorPos += displayedItems - 1;
        topMostPos += displayedItems - 1;
      }
      clampPos();
      onCursorPositionChange(topMostPos, cursorPos);
    }

    useCommandBindings(
      {
        cursorLeft: () => moveCursorLeftRight("left"),
        cursorRight: () => moveCursorLeftRight("right"),
        cursorUp: () => scroll(-1, false),
        cursorDown: () => scroll(1, false),
        cursorStart: () => moveCursorToPos(0),
        cursorEnd: () => moveCursorToPos(items.length - 1),
        cursorPageUp: () => moveCursorPage("up"),
        cursorPageDown: () => moveCursorPage("down"),
      },
      focused
    );

    const executeBuiltInCommand = useExecuteBuiltInCommand();

    const onResize = useCallback((maxItemsPerColumn: number) => setMaxItemsPerColumn(maxItemsPerColumn), []);
    const onItemClicked = useCallback((pos: number) => onCursorPositionChange(topMostPos, pos), [onCursorPositionChange, topMostPos]);
    const onItemActivated = useCallback(() => executeBuiltInCommand("open"), [executeBuiltInCommand]);

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
                // .filter((x) => x)
                .map((x, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Breadcrumb.Item key={i}>{x}</Breadcrumb.Item>
                ))}
            </Breadcrumb>
            {/* <PanelHeader active={focused}>{title}</PanelHeader> */}
            <PanelColumns
              onWheel={(e) => scroll(Math.sign(e.deltaY), true)}
              onKeyDown={(e) => {
                // dispatch({ type: "findFirst", char: e.key });
                e.preventDefault();
              }}
            >
              {view.type === "full" ? (
                <FullView
                  cursorStyle={cursorStyle}
                  items={items}
                  topMostPos={topMostPos}
                  cursorPos={cursorPos}
                  onItemClicked={onItemClicked}
                  onItemActivated={onItemActivated}
                  onMaxVisibleItemsChanged={onResize}
                  columnDefs={view.columnDefs}
                />
              ) : (
                <CondensedView
                  cursorStyle={cursorStyle}
                  items={items}
                  topMostPos={topMostPos}
                  cursorPos={cursorPos}
                  columnsCount={columnsCount}
                  onItemClicked={onItemClicked}
                  onItemActivated={onItemActivated}
                  onMaxItemsPerColumnChanged={onResize}
                  columnDef={view.columnDef}
                />
              )}
            </PanelColumns>
            <FileInfoPanel>
              <Border {...theme.filePanel.fileInfo.border}>
                <FileInfoFooter file={items[cursorPos]} />
              </Border>
            </FileInfoPanel>
            <PanelFooter>321</PanelFooter>
          </PanelContent>
        </Border>
      </PanelRoot>
    );
  }
);
