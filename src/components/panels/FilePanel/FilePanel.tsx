import equal from "fast-deep-equal";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { GlyphSizeProvider } from "../../../contexts/glyphSizeContext";
import { useCommandBindings, useExecuteBuiltInCommand, useSetContextVariables } from "../../../features/commands";
import type { FsEntry } from "../../../features/fs/types";
import type { CursorPosition } from "../../../features/panels";
import { css } from "../../../features/styles";
import { useElementSize } from "../../../hooks/useElementSize";
import { useFocused } from "../../../hooks/useFocused";
import { usePrevValueIfDeepEqual } from "../../../hooks/usePrevValueIfDeepEqual";
import { folder_stats } from "../../../paraglide/messages";
import type { FilePanelView } from "../../../types";
import type { List } from "../../../utils/immutableList";
import { clamp } from "../../../utils/number";
import { Border } from "../../Border";
import { Breadcrumb } from "../../Breadcrumb";
import { PanelHeader } from "../../PanelHeader";
import { FileInfoFooter } from "./FileInfoFooter";
import type { CursorStyle } from "./types";
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
}

export interface FilePanelActions {
  focus(): void;
}

function adjustCursor(cursor: CursorPosition, items: List<FsEntry>, displayedItems: number): Required<CursorPosition> {
  let selectedIndex = cursor.selectedIndex ?? 0;
  let topmostIndex = cursor.topmostIndex ?? 0;
  let selectedName = cursor.selectedName ?? items.get(selectedIndex)?.name;
  let topmostName = cursor.topmostName ?? items.get(topmostIndex)?.name;

  selectedIndex = clamp(0, selectedIndex, items.size() - 1);
  topmostIndex = clamp(0, topmostIndex, items.size() - displayedItems);
  topmostIndex = clamp(selectedIndex - displayedItems + 1, topmostIndex, selectedIndex);

  if (selectedName !== items.get(selectedIndex)?.name) {
    const idx = items.findIndex((i) => i.name === selectedName);
    if (idx >= 0) {
      selectedIndex = idx;
    } else {
      selectedName = items.get(selectedIndex)?.name;
    }
  }
  if (topmostName !== items.get(topmostIndex)?.name) {
    const idx = items.findIndex((i) => i.name === topmostName);
    if (idx >= 0) {
      topmostIndex = idx;
    } else {
      topmostName = items.get(topmostIndex)?.name;
    }
  }
  topmostIndex = clamp(0, topmostIndex, items.size() - displayedItems);
  topmostIndex = clamp(selectedIndex - displayedItems + 1, topmostIndex, selectedIndex);
  return {
    selectedIndex,
    topmostIndex,
    selectedName: selectedName ?? "",
    topmostName: topmostName ?? "",
  };
}

export const FilePanel = memo(
  forwardRef<FilePanelActions, FilePanelProps>(({ items, cursor, view, path, showCursorWhenBlurred, onFocus, onCursorPositionChange }, ref) => {
    const panelRootRef = useRef<HTMLDivElement>(null);
    const { width } = useElementSize(panelRootRef);
    const [maxItemsPerColumn, setMaxItemsPerColumn] = useState<number>();

    let columnCount: number | undefined;
    if (view.type === "full") {
      columnCount = 1;
    } else if (width) {
      columnCount = Math.ceil(width / 350);
    }

    const displayedItems = columnCount && maxItemsPerColumn ? Math.min(items.size(), maxItemsPerColumn * columnCount) : 1;

    const adjustedCursor = usePrevValueIfDeepEqual(adjustCursor(cursor, items, displayedItems));

    const focused = useFocused(panelRootRef);
    useImperativeHandle(ref, () => ({
      focus: () => panelRootRef.current?.focus(),
    }));

    useSetContextVariables("filePanel.focus", focused);
    useSetContextVariables({ "filePanel.firstItem": cursor.selectedIndex === 0 }, focused);
    useSetContextVariables({ "filePanel.lastItem": cursor.selectedIndex === items.size() - 1 }, focused);
    useSetContextVariables({ "filePanel.selectedItem": cursor.selectedName }, focused);
    useSetContextVariables({ "filePanel.path": path }, focused);

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
      c.selectedName = items.get(c.selectedIndex)?.name ?? "";
      c.topmostName = items.get(c.topmostIndex)?.name ?? "";
      c = adjustCursor(c, items, displayedItems);
      if (!equal(c, adjustedCursor)) {
        onCursorPositionChange(c);
      }
    }

    const adjustedCursorRef = useRef(adjustedCursor);
    adjustedCursorRef.current = adjustedCursor;
    const scroll = useCallback(
      (delta: number, followCursor: boolean) => {
        let c = structuredClone(adjustedCursorRef.current);
        c.selectedIndex += delta;
        if (followCursor) {
          c.topmostIndex += delta;
        }
        c.selectedName = items.get(c.selectedIndex)?.name ?? "";
        c.topmostName = items.get(c.topmostIndex)?.name ?? "";
        c = adjustCursor(c, items, displayedItems);
        if (!equal(c, adjustedCursorRef.current)) {
          onCursorPositionChange(c);
        }
      },
      [items, displayedItems, onCursorPositionChange],
    );

    const moveCursorToPos = useCallback(
      (pos: number) => {
        let c = structuredClone(adjustedCursor);
        c.selectedIndex = pos;
        c.selectedName = items.get(pos)?.name ?? "";
        c.topmostName = items.get(c.topmostIndex)?.name ?? "";
        c = adjustCursor(c, items, displayedItems);
        if (!equal(c, adjustedCursor)) {
          onCursorPositionChange(c);
        }
      },
      [adjustedCursor, displayedItems, items, onCursorPositionChange],
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
      c.selectedName = items.get(c.selectedIndex)?.name ?? "";
      c.topmostName = items.get(c.topmostIndex)?.name ?? "";
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
        cursorEnd: () => moveCursorToPos(items.size() - 1),
        cursorPageUp: () => moveCursorPage("up"),
        cursorPageDown: () => moveCursorPage("down"),
      },
      focused,
    );

    const executeBuiltInCommand = useExecuteBuiltInCommand();

    const onMaxItemsPerColumnChanged = useCallback((maxItemsPerColumn: number) => setMaxItemsPerColumn(maxItemsPerColumn), []);
    const onItemClicked = useCallback((pos: number) => moveCursorToPos(pos), [moveCursorToPos]);
    const onItemActivated = useCallback(() => {
      void executeBuiltInCommand("open", { path });
    }, [executeBuiltInCommand, path]);
    const selectedIndexRef = useRef(cursor.selectedIndex);
    selectedIndexRef.current = cursor.selectedIndex;
    const handleSelect = useCallback((topmost: number, selected: number) => scroll(selected - (selectedIndexRef.current ?? 0), true), [scroll]);
    const handleFocus = useCallback(() => onFocus?.(), [onFocus]);

    let cursorStyle: CursorStyle;
    if (focused) {
      cursorStyle = "firm";
    } else if (showCursorWhenBlurred) {
      cursorStyle = "inactive";
    } else {
      cursorStyle = "hidden";
    }

    const bytesCount = useMemo(() => items.reduce((acc, item) => acc + ((item.isFile ? item.size : 0) ?? 0), 0), [items]);
    const filesCount = useMemo(() => items.reduce((acc, item) => acc + (item.isFile ? 1 : 0), 0), [items]);

    const pathParts = path.split("/");
    if (!columnCount) {
      return <div className={css("panel-root", focused ? "-focused" : "")} ref={panelRootRef} tabIndex={0} onFocus={handleFocus} />;
    }

    return (
      <div className={css("panel-root", focused ? "-focused" : "")} ref={panelRootRef} tabIndex={0} onFocus={handleFocus}>
        <GlyphSizeProvider>
          <Border color={focused ? "panel-border-focus" : "panel-border"}>
            <div className={css("panel-content")}>
              <PanelHeader active={focused}>
                <Breadcrumb isActive={focused}>
                  {pathParts.map((x, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <Breadcrumb.Item key={i}>{x}</Breadcrumb.Item>
                  ))}
                </Breadcrumb>
              </PanelHeader>
              <div
                className={css("panel-columns")}
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
              </div>
              <div className={css("file-info-panel")}>
                <Border color={"panel-border"}>
                  <FileInfoFooter file={items.get(adjustedCursor.selectedIndex)} />
                </Border>
              </div>
              <div className={css("panel-footer")}>
                {folder_stats({
                  bytes: bytesCount.toLocaleString(),
                  files: filesCount.toLocaleString(),
                })}
              </div>
            </div>
          </Border>
        </GlyphSizeProvider>
      </div>
    );
  }),
);
FilePanel.displayName = "FilePanel";
