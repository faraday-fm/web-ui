import { Border } from "@components/Border/Border";
import { GlyphSizeProvider } from "@contexts/glyphSizeContext";
import { FsEntry } from "@features/fs/types";
import { CursorPosition } from "@features/panels/panelsSlice";
import { useCommandBindings, useExecuteBuiltInCommand } from "@hooks/useCommandBinding";
import { useCommandContext } from "@hooks/useCommandContext";
import { useElementSize } from "@hooks/useElementSize";
import { useFocused } from "@hooks/useFocused";
import { FilePanelView } from "@types";
import { clamp } from "@utils/numberUtils";
import { List } from "list";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";

import { Breadcrumb } from "../../Breadcrumb/Breadcrumb";
import { FileInfoFooter } from "./FileInfoFooter/FileInfoFooter";
import { CursorStyle } from "./types";
import { CondensedView } from "./views/CondensedView/CondensedView";
import { FullView } from "./views/FullView/FullView";

export type FilePanelProps = {
  items: List<FsEntry>;
  cursor: CursorPosition;
  view: FilePanelView;
  path: string;
  showCursorWhenBlurred?: boolean;
  onFocus?: () => void;
  onCursorPositionChange: (newPosition: CursorPosition) => void;
  onDirUp?: () => void;
};

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
  user-select: none;
  ${(p) => p.theme.filePanel.extension}
`;

const PanelContent = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  overflow: hidden;
  margin: ${(p) => p.theme.filePanel.content.margin};
  ${(p) => p.theme.filePanel.content.extension}
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
  overflow: hidden;
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

function adjustCursor(cursor: CursorPosition, items: List<FsEntry>, displayedItems: number): Required<CursorPosition> {
  let selectedIndex = cursor.selectedIndex ?? 0;
  let topmostIndex = cursor.topmostIndex ?? 0;
  let selectedName = cursor.selectedName ?? items.nth(selectedIndex)?.name;
  let topmostName = cursor.topmostName ?? items.nth(topmostIndex)?.name;

  selectedIndex = clamp(0, selectedIndex, items.length - 1);
  topmostIndex = clamp(0, topmostIndex, items.length - displayedItems);
  topmostIndex = clamp(selectedIndex - displayedItems + 1, topmostIndex, selectedIndex);

  if (selectedName !== items.nth(selectedIndex)?.name) {
    const idx = items.findIndex((i) => i.name === selectedName);
    if (idx >= 0) {
      selectedIndex = idx;
    } else {
      selectedName = items.nth(selectedIndex)?.name;
    }
  }
  if (topmostName !== items.nth(topmostIndex)?.name) {
    const idx = items.findIndex((i) => i.name === topmostName);
    if (idx >= 0) {
      topmostIndex = idx;
    } else {
      topmostName = items.nth(topmostIndex)?.name;
    }
  }
  topmostIndex = clamp(0, topmostIndex, items.length - displayedItems);
  topmostIndex = clamp(selectedIndex - displayedItems + 1, topmostIndex, selectedIndex);
  return { selectedIndex, topmostIndex, selectedName: selectedName ?? "", topmostName: topmostName ?? "" };
}

export const FilePanel = forwardRef<FilePanelActions, FilePanelProps>(
  ({ items, cursor, view, path, showCursorWhenBlurred, onFocus, onCursorPositionChange, onDirUp }, ref) => {
    const panelRootRef = useRef<HTMLDivElement>(null);
    const { width } = useElementSize(panelRootRef);
    const [maxItemsPerColumn, setMaxItemsPerColumn] = useState<number>();

    let columnsCount: number | undefined;
    if (view.type === "full") {
      columnsCount = 1;
    } else if (width) {
      columnsCount = Math.ceil(width / 350);
    }

    const displayedItems = columnsCount && maxItemsPerColumn ? Math.min(items.length, maxItemsPerColumn * columnsCount) : 1;

    let adjustedCursor = adjustCursor(cursor, items, displayedItems);

    const focused = useFocused(panelRootRef);
    useImperativeHandle(ref, () => ({
      focus: () => panelRootRef.current?.focus(),
    }));

    useCommandContext("filePanel.focus", focused);
    useCommandContext({ "filePanel.firstItem": cursor.selectedIndex === 0 }, focused);
    useCommandContext({ "filePanel.lastItem": cursor.selectedIndex === items.length - 1 }, focused);

    function moveCursorLeftRight(direction: "left" | "right") {
      if (direction === "right") {
        adjustedCursor.selectedIndex += maxItemsPerColumn ?? 0;
        if (adjustedCursor.selectedIndex >= adjustedCursor.topmostIndex + displayedItems) {
          adjustedCursor.topmostIndex += maxItemsPerColumn ?? 0;
        }
      } else if (direction === "left") {
        adjustedCursor.selectedIndex -= maxItemsPerColumn ?? 0;
        if (adjustedCursor.selectedIndex < adjustedCursor.topmostIndex) {
          adjustedCursor.topmostIndex -= maxItemsPerColumn ?? 0;
        }
      }
      adjustedCursor.selectedName = items.nth(adjustedCursor.selectedIndex)?.name ?? "";
      adjustedCursor.topmostName = items.nth(adjustedCursor.topmostIndex)?.name ?? "";
      adjustedCursor = adjustCursor(adjustedCursor, items, displayedItems);
      onCursorPositionChange(adjustedCursor);
    }

    function scroll(delta: number, followCursor: boolean) {
      adjustedCursor.selectedIndex += delta;
      if (followCursor) {
        adjustedCursor.topmostIndex += delta;
      }
      adjustedCursor.selectedName = items.nth(adjustedCursor.selectedIndex)?.name ?? "";
      adjustedCursor.topmostName = items.nth(adjustedCursor.topmostIndex)?.name ?? "";
      adjustedCursor = adjustCursor(adjustedCursor, items, displayedItems);
      onCursorPositionChange(adjustedCursor);
    }

    const moveCursorToPos = useCallback(
      (pos: number) => {
        let cur = adjustedCursor;
        cur.selectedIndex = pos;
        cur.selectedName = items.nth(pos)?.name ?? "";
        cur = adjustCursor(cur, items, displayedItems);
        onCursorPositionChange(cur);
      },
      [adjustedCursor, displayedItems, items, onCursorPositionChange]
    );

    function moveCursorPage(direction: "up" | "down") {
      if (direction === "up") {
        adjustedCursor.selectedIndex -= displayedItems - 1;
        adjustedCursor.topmostIndex -= displayedItems - 1;
      } else if (direction === "down") {
        adjustedCursor.selectedIndex += displayedItems - 1;
        adjustedCursor.topmostIndex += displayedItems - 1;
      }
      adjustedCursor.selectedName = items.nth(adjustedCursor.selectedIndex)?.name ?? "";
      adjustedCursor.topmostName = items.nth(adjustedCursor.topmostIndex)?.name ?? "";
      adjustedCursor = adjustCursor(adjustedCursor, items, displayedItems);
      onCursorPositionChange(adjustedCursor);
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
        dirUp: () => onDirUp?.(),
      },
      focused
    );

    const executeBuiltInCommand = useExecuteBuiltInCommand();

    const onMaxItemsPerColumnChanged = useCallback((maxItemsPerColumn: number) => setMaxItemsPerColumn(maxItemsPerColumn), []);
    const onItemClicked = useCallback((pos: number) => moveCursorToPos(pos), [moveCursorToPos]);
    const onItemActivated = useCallback(() => executeBuiltInCommand("open", { path }), [executeBuiltInCommand, path]);

    let cursorStyle: CursorStyle;
    if (focused) {
      cursorStyle = "firm";
    } else if (showCursorWhenBlurred) {
      cursorStyle = "inactive";
    } else {
      cursorStyle = "hidden";
    }

    const theme = useTheme();

    const bytesCount = useMemo(() => items.reduce((acc, item) => acc + (item.size ?? 0), 0), [items]);
    const filesCount = useMemo(() => items.reduce((acc, item) => acc + (item.isFile ? 1 : 0), 0), [items]);

    const pathParts = path.split("/").filter((x) => x);
    if (pathParts.length === 0) {
      pathParts.push("/");
    }

    const [touchY, setTouchY] = useState(0);

    if (!columnsCount) {
      return <PanelRoot ref={panelRootRef} tabIndex={0} onFocus={() => onFocus?.()} />;
    }

    const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      setTouchY(e.changedTouches.item(0).clientY);
      e.stopPropagation();
    };

    const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      scroll(-Math.sign(e.changedTouches.item(0).clientY - touchY), true);
      setTouchY(e.changedTouches.item(0).clientY);
      e.stopPropagation();
    };

    // const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    // };

    return (
      <PanelRoot
        ref={panelRootRef}
        tabIndex={0}
        onFocus={() => onFocus?.()}
        onTouchStartCapture={onTouchStart}
        onTouchMoveCapture={onTouchMove}
        // onTouchEndCapture={onTouchEnd}
      >
        <GlyphSizeProvider>
          <Border {...theme.filePanel.border}>
            <PanelContent>
              <PanelHeader active={focused}>
                <Breadcrumb isActive={focused}>
                  {pathParts.map((x, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Breadcrumb.Item key={i}>{x}</Breadcrumb.Item>
                  ))}
                </Breadcrumb>
              </PanelHeader>
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
                    cursor={adjustedCursor}
                    onItemClicked={onItemClicked}
                    onItemActivated={onItemActivated}
                    onMaxVisibleItemsChanged={onMaxItemsPerColumnChanged}
                    columnDefs={view.columnDefs}
                  />
                ) : (
                  <CondensedView
                    cursorStyle={cursorStyle}
                    items={items}
                    cursor={adjustedCursor}
                    columnsCount={columnsCount}
                    onItemClicked={onItemClicked}
                    onItemActivated={onItemActivated}
                    onMaxItemsPerColumnChanged={onMaxItemsPerColumnChanged}
                    columnDef={view.columnDef}
                  />
                )}
              </PanelColumns>
              <FileInfoPanel>
                <Border {...theme.filePanel.fileInfo.border}>
                  <FileInfoFooter file={items.nth(adjustedCursor.selectedIndex)} />
                </Border>
              </FileInfoPanel>
              <PanelFooter>
                {bytesCount.toLocaleString()} bytes in {filesCount.toLocaleString()} files
              </PanelFooter>
            </PanelContent>
          </Border>
        </GlyphSizeProvider>
      </PanelRoot>
    );
  }
);
