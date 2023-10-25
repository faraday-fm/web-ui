import { Border } from "@components/Border";
import { PanelHeader } from "@components/PanelHeader";
import { GlyphSizeProvider } from "@contexts/glyphSizeContext";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { useCommandBindings, useCommandContext, useExecuteBuiltInCommand } from "@features/commands";
import { FsEntry } from "@features/fs/types";
import { CursorPosition } from "@features/panels";
import { useElementSize } from "@hooks/useElementSize";
import { useFocused } from "@hooks/useFocused";
import { usePrevValueIfDeepEqual } from "@hooks/usePrevValueIfDeepEqual";
import { FilePanelView } from "@types";
import { clamp } from "@utils/number";
import equal from "fast-deep-equal";
import type { List } from "list";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Breadcrumb } from "../../Breadcrumb";
import { FileInfoFooter } from "./FileInfoFooter";
import { CursorStyle } from "./types";
import { CondensedView } from "./views/CondensedView";
import { FullView } from "./views/FullView";

export interface FilePanelProps {
  items: List<FsEntry>;
  cursor: CursorPosition;
  view: FilePanelView;
  path: string;
  showCursorWhenBlurred?: boolean;
  onFocus?: () => void;
  onCursorPositionChange: (newPosition: CursorPosition) => void;
  onDirUp?: () => void;
}

export interface FilePanelActions {
  focus(): void;
}

const PanelRoot = styled.div<{ $focused: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  color: ${(p) => p.theme.colors["panel.foreground"]};
  background-color: ${(p) => (p.$focused ? p.theme.colors["panel.background:focus"] : p.theme.colors["panel.background"])};
  display: grid;
  overflow: hidden;
  outline: none;
  user-select: none;
`;

const PanelContent = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  overflow: hidden;
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

const PanelFooter = styled.div`
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

export const FilePanel = memo(
  forwardRef<FilePanelActions, FilePanelProps>(({ items, cursor, view, path, showCursorWhenBlurred, onFocus, onCursorPositionChange, onDirUp }, ref) => {
    const panelRootRef = useRef<HTMLDivElement>(null);
    const { width } = useElementSize(panelRootRef);
    const [maxItemsPerColumn, setMaxItemsPerColumn] = useState<number>();

    let columnCount: number | undefined;
    if (view.type === "full") {
      columnCount = 1;
    } else if (width) {
      columnCount = Math.ceil(width / 350);
    }

    const displayedItems = columnCount && maxItemsPerColumn ? Math.min(items.length, maxItemsPerColumn * columnCount) : 1;

    const adjustedCursor = usePrevValueIfDeepEqual(adjustCursor(cursor, items, displayedItems));

    const focused = useFocused(panelRootRef);
    useImperativeHandle(ref, () => ({
      focus: () => panelRootRef.current?.focus(),
    }));

    useCommandContext("filePanel.focus", focused);
    useCommandContext({ "filePanel.firstItem": cursor.selectedIndex === 0 }, focused);
    useCommandContext({ "filePanel.lastItem": cursor.selectedIndex === items.length - 1 }, focused);

    function moveCursorLeftRight(direction: "left" | "right") {
      let c = structuredClone(adjustedCursor);
      if (direction === "right") {
        c.selectedIndex += maxItemsPerColumn ?? 0;
        if (c.selectedIndex >= c.topmostIndex + displayedItems) {
          c.topmostIndex += maxItemsPerColumn ?? 0;
        }
      } else if (direction === "left") {
        c.selectedIndex -= maxItemsPerColumn ?? 0;
        if (c.selectedIndex < c.topmostIndex) {
          c.topmostIndex -= maxItemsPerColumn ?? 0;
        }
      }
      c.selectedName = items.nth(c.selectedIndex)?.name ?? "";
      c.topmostName = items.nth(c.topmostIndex)?.name ?? "";
      c = adjustCursor(c, items, displayedItems);
      if (!equal(c, adjustedCursor)) {
        onCursorPositionChange(c);
      }
    }

    const scroll = useCallback(
      (delta: number, followCursor: boolean) => {
        let c = structuredClone(adjustedCursor);
        c.selectedIndex += delta;
        if (followCursor) {
          c.topmostIndex += delta;
        }
        c.selectedName = items.nth(c.selectedIndex)?.name ?? "";
        c.topmostName = items.nth(c.topmostIndex)?.name ?? "";
        c = adjustCursor(c, items, displayedItems);
        if (!equal(c, adjustedCursor)) {
          onCursorPositionChange(c);
        }
      },
      [adjustedCursor, items, displayedItems, onCursorPositionChange]
    );

    const moveCursorToPos = useCallback(
      (pos: number) => {
        let c = structuredClone(adjustedCursor);
        c.selectedIndex = pos;
        c.selectedName = items.nth(pos)?.name ?? "";
        c.topmostName = items.nth(c.topmostIndex)?.name ?? "";
        c = adjustCursor(c, items, displayedItems);
        if (!equal(c, adjustedCursor)) {
          onCursorPositionChange(c);
        }
      },
      [adjustedCursor, displayedItems, items, onCursorPositionChange]
    );

    function moveCursorPage(direction: "up" | "down") {
      let c = structuredClone(adjustedCursor);
      if (direction === "up") {
        c.selectedIndex -= displayedItems - 1;
        c.topmostIndex -= displayedItems - 1;
      } else if (direction === "down") {
        c.selectedIndex += displayedItems - 1;
        c.topmostIndex += displayedItems - 1;
      }
      c.selectedName = items.nth(c.selectedIndex)?.name ?? "";
      c.topmostName = items.nth(c.topmostIndex)?.name ?? "";
      c = adjustCursor(c, items, displayedItems);
      if (!equal(c, adjustedCursor)) {
        onCursorPositionChange(c);
      }
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
    const onItemActivated = useCallback(() => {
      void executeBuiltInCommand("open", { path });
    }, [executeBuiltInCommand, path]);
    const handleSelect = useCallback(
      (topmost: number, selected: number) => scroll(selected - (cursor.selectedIndex ?? 0), true),
      [cursor.selectedIndex, scroll]
    );
    const handleFocus = useCallback(() => onFocus?.(), [onFocus]);

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
    if (!columnCount) {
      return <PanelRoot ref={panelRootRef} tabIndex={0} $focused={focused} onFocus={handleFocus} />;
    }

    return (
      <PanelRoot ref={panelRootRef} tabIndex={0} $focused={focused} onFocus={handleFocus}>
        <GlyphSizeProvider>
          <Border $color={focused ? theme.colors["panel.border:focus"] : theme.colors["panel.border"]}>
            <PanelContent>
              <PanelHeader $active={focused}>
                <Breadcrumb isActive={focused}>
                  {pathParts.map((x, i) => (
                    <Breadcrumb.Item key={i}>{x}</Breadcrumb.Item>
                  ))}
                </Breadcrumb>
              </PanelHeader>
              <PanelColumns
                // onWheel={(e) => scroll(Math.sign(e.deltaY), true)}
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
                    topmostIndex={adjustedCursor.topmostIndex}
                    selectedIndex={adjustedCursor.selectedIndex}
                    columnCount={columnCount}
                    onItemClicked={onItemClicked}
                    onItemActivated={onItemActivated}
                    onMaxItemsPerColumnChanged={onMaxItemsPerColumnChanged}
                    onSelect={handleSelect}
                  />
                )}
              </PanelColumns>
              <FileInfoPanel>
                <Border $color={theme.colors["panel.border"]}>
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
  })
);
FilePanel.displayName = "FilePanel";
