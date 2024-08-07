import equal from "fast-deep-equal";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { GlyphSizeProvider } from "../../../contexts/glyphSizeContext";
import { useCommandBindings, useExecuteCommand, useSetContextVariables } from "../../../features/commands";
import type { Dirent } from "../../../features/fs/types";
import { isDir } from "../../../features/fs/utils";
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
  items: List<Dirent>;
  selectedItemNames: List<string>;
  cursor: CursorPosition;
  view: FilePanelView;
  path: string;
  showCursorWhenBlurred?: boolean;
  onFocus?: () => void;
  onCursorPositionChange: (newPosition: CursorPosition, select: boolean) => void;
  onSelectItems: (names: string[], select: boolean) => void;
}

export interface FilePanelActions {
  focus(): void;
}

function adjustCursor(cursor: CursorPosition, items: List<Dirent>, displayedItems: number): Required<CursorPosition> {
  let selectedIndex = cursor.activeIndex ?? 0;
  let topmostIndex = cursor.topmostIndex ?? 0;
  const selectedName = cursor.activeName ?? items.get(selectedIndex)?.filename;
  const topmostName = cursor.topmostName ?? items.get(topmostIndex)?.filename;

  selectedIndex = clamp(0, selectedIndex, items.size() - 1);
  topmostIndex = clamp(0, topmostIndex, items.size() - displayedItems);
  topmostIndex = clamp(selectedIndex - displayedItems + 1, topmostIndex, selectedIndex);

  const updateIndexByName = (name: string | undefined, fallbackIndex: number) => {
    if (name !== items.get(fallbackIndex)?.filename) {
      const idx = items.findIndex((i) => i.filename === name);
      if (idx >= 0) {
        return idx;
      }
    }
    return fallbackIndex;
  };

  selectedIndex = updateIndexByName(selectedName, selectedIndex);
  topmostIndex = updateIndexByName(topmostName, topmostIndex);

  topmostIndex = clamp(0, topmostIndex, items.size() - displayedItems);
  topmostIndex = clamp(selectedIndex - displayedItems + 1, topmostIndex, selectedIndex);
  return {
    activeIndex: selectedIndex,
    topmostIndex,
    activeName: selectedName ?? "",
    topmostName: topmostName ?? "",
  };
}

export const FilePanel = memo(
  forwardRef<FilePanelActions, FilePanelProps>((props, ref) => {
    const { items, selectedItemNames, cursor, view, path, showCursorWhenBlurred, onFocus, onCursorPositionChange } = props;

    const onFocusRef = useRef(onFocus);
    const onCursorPositionChangeRef = useRef(onCursorPositionChange);
    onCursorPositionChangeRef.current = onCursorPositionChange;

    const panelRootRef = useRef<HTMLDivElement>(null);
    const { width } = useElementSize(panelRootRef);
    const [maxItemsPerColumn, setMaxItemsPerColumn] = useState<number>();

    const columnCount = useMemo(() => {
      if (view.type === "full") return 1;
      return width ? Math.ceil(width / 350) : undefined;
    }, [view.type, width]);

    const displayedItems = columnCount && maxItemsPerColumn ? Math.min(items.size(), maxItemsPerColumn * columnCount) : 1;

    const adjustedCursor = usePrevValueIfDeepEqual(adjustCursor(cursor, items, displayedItems));
    const focused = useFocused(panelRootRef);

    useImperativeHandle(ref, () => ({
      focus: () => panelRootRef.current?.focus(),
    }));

    useSetContextVariables("filePanel.focus", focused);
    useSetContextVariables({ "filePanel.firstItem": cursor.activeIndex === 0 }, focused);
    useSetContextVariables({ "filePanel.lastItem": cursor.activeIndex === items.size() - 1 }, focused);
    useSetContextVariables({ "filePanel.activeItem": cursor.activeName }, focused);
    useSetContextVariables({ "filePanel.path": path }, focused);

    const moveCursorLeftRight = useCallback(
      (direction: "left" | "right", select: boolean) => {
        let newCursor = structuredClone(adjustedCursor);
        if (direction === "right") {
          newCursor.activeIndex += maxItemsPerColumn ?? 0;
          if (newCursor.activeIndex >= newCursor.topmostIndex + displayedItems) {
            newCursor.topmostIndex += maxItemsPerColumn ?? 0;
          }
        } else if (direction === "left") {
          newCursor.activeIndex -= maxItemsPerColumn ?? 0;
          if (newCursor.activeIndex < newCursor.topmostIndex) {
            newCursor.topmostIndex -= maxItemsPerColumn ?? 0;
          }
        }
        newCursor.activeName = items.get(newCursor.activeIndex)?.filename ?? "";
        newCursor.topmostName = items.get(newCursor.topmostIndex)?.filename ?? "";
        newCursor = adjustCursor(newCursor, items, displayedItems);
        if (!equal(newCursor, adjustedCursor)) {
          onCursorPositionChangeRef.current(newCursor, select);
        }
      },
      [adjustedCursor, displayedItems, items, maxItemsPerColumn],
    );

    const adjustedCursorRef = useRef(adjustedCursor);
    adjustedCursorRef.current = adjustedCursor;
    const scroll = useCallback(
      (delta: number, followCursor: boolean, select: boolean) => {
        let c = structuredClone(adjustedCursorRef.current);
        c.activeIndex += delta;
        if (followCursor) {
          c.topmostIndex += delta;
        }
        c.activeName = items.get(c.activeIndex)?.filename ?? "";
        c.topmostName = items.get(c.topmostIndex)?.filename ?? "";
        c = adjustCursor(c, items, displayedItems);
        if (!equal(c, adjustedCursorRef.current)) {
          onCursorPositionChangeRef.current(c, select);
        }
      },
      [items, displayedItems],
    );

    const moveCursorToPos = useCallback(
      (pos: number, select: boolean) => {
        let c = structuredClone(adjustedCursor);
        c.activeIndex = pos;
        c.activeName = items.get(pos)?.filename ?? "";
        c.topmostName = items.get(c.topmostIndex)?.filename ?? "";
        c = adjustCursor(c, items, displayedItems);
        if (!equal(c, adjustedCursor)) {
          onCursorPositionChangeRef.current(c, select);
        }
      },
      [adjustedCursor, displayedItems, items],
    );

    const moveCursorPage = useCallback(
      (direction: "up" | "down", select: boolean) => {
        let c = structuredClone(adjustedCursor);
        if (direction === "up") {
          c.activeIndex -= displayedItems - 1;
          c.topmostIndex -= displayedItems - 1;
        } else if (direction === "down") {
          c.activeIndex += displayedItems - 1;
          c.topmostIndex += displayedItems - 1;
        }
        c.activeName = items.get(c.activeIndex)?.filename ?? "";
        c.topmostName = items.get(c.topmostIndex)?.filename ?? "";
        c = adjustCursor(c, items, displayedItems);
        if (!equal(c, adjustedCursor)) {
          onCursorPositionChangeRef.current(c, select);
        }
      },
      [adjustedCursor, displayedItems, items],
    );

    useCommandBindings(
      {
        cursorLeft: (args) => moveCursorLeftRight("left", Boolean(args?.select)),
        cursorRight: (args) => moveCursorLeftRight("right", Boolean(args?.select)),
        cursorUp: (args) => scroll(-1, false, Boolean(args?.select)),
        cursorDown: (args) => scroll(1, false, Boolean(args?.select)),
        cursorStart: (args) => moveCursorToPos(0, Boolean(args?.select)),
        cursorEnd: (args) => moveCursorToPos(items.size() - 1, Boolean(args?.select)),
        cursorPageUp: (args) => moveCursorPage("up", Boolean(args?.select)),
        cursorPageDown: (args) => moveCursorPage("down", Boolean(args?.select)),
      },
      focused,
    );

    const executeCommand = useExecuteCommand();
    const onItemActivated = useCallback(() => executeCommand("open", { path }), [executeCommand, path]);

    const onMaxItemsPerColumnChanged = useCallback((maxItemsPerColumn: number) => setMaxItemsPerColumn(maxItemsPerColumn), []);
    const onItemClicked = useCallback((pos: number) => moveCursorToPos(pos, false), [moveCursorToPos]);
    const selectedIndexRef = useRef(cursor.activeIndex);
    selectedIndexRef.current = cursor.activeIndex;
    const handlePosChange = useCallback((topmost: number, active: number) => scroll(active - (selectedIndexRef.current ?? 0), true, false), [scroll]);
    const handleFocus = useCallback(() => onFocusRef.current?.(), []);

    let cursorStyle: CursorStyle;
    if (focused) {
      cursorStyle = "firm";
    } else if (showCursorWhenBlurred) {
      cursorStyle = "inactive";
    } else {
      cursorStyle = "hidden";
    }

    const bytesCount = useMemo(() => items.reduce((acc, item) => acc + ((!isDir(item) ? item.attrs.size : 0) ?? 0), 0), [items]);
    const filesCount = useMemo(() => items.reduce((acc, item) => acc + (!isDir(item) ? 1 : 0), 0), [items]);

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
                    selectedItemNames={selectedItemNames}
                    topmostIndex={adjustedCursor.topmostIndex}
                    selectedIndex={adjustedCursor.activeIndex}
                    columnCount={columnCount}
                    onItemClicked={onItemClicked}
                    onItemActivated={onItemActivated}
                    onMaxItemsPerColumnChanged={onMaxItemsPerColumnChanged}
                    onPosChange={handlePosChange}
                  />
                )}
              </div>
              <div className={css("file-info-panel")}>
                <Border color={"panel-border"}>
                  <FileInfoFooter file={items.get(adjustedCursor.activeIndex)} />
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
