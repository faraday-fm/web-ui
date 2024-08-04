import { memo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { FilePanel, type FilePanelActions } from "../components/panels/FilePanel/FilePanel";
import { ContextVariablesProvider, DebugContextVariables } from "../features/commands";
import { useDirListing } from "../features/fs/hooks";
import type { FsEntry } from "../features/fs/types";
import { useGlobalContext } from "../features/globalContext";
import { type CursorPosition, usePanelState, usePanels } from "../features/panels";
import { css } from "../features/styles";
import type { FilePanelLayout } from "../types";
import { createList, empty } from "../utils/immutableList";
import { combine, isRoot } from "../utils/path";

interface ReduxFilePanelProps {
  layout: FilePanelLayout & { id: string };
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  usage: "sort",
  sensitivity: "case",
});

function fsCompare(a: FsEntry, b: FsEntry) {
  if (a.isDir && !b.isDir) return -1;
  if (!a.isDir && b.isDir) return 1;
  return collator.compare(a.name, b.name);
}

export const ReduxFilePanel = memo(function ReduxFilePanel({ layout }: ReduxFilePanelProps) {
  const { id } = layout;
  const panelRef = useRef<FilePanelActions>(null);
  const { activeFilePanel, initPanelState, setPanelItems, setPanelSelectedItems, setPanelCursorPos, setActivePanelId } = usePanels();
  const state = usePanelState(id);
  const { updateState } = useGlobalContext();
  const isActive = activeFilePanel?.id === id;

  const items = state?.items ?? createList();
  const selectedItems = state?.selectedItems ?? createList();
  const cursor = state?.pos.cursor ?? {};
  const activeItem = state?.items ? state.items.get(cursor.activeIndex ?? 0) : undefined;

  useEffect(() => {
    if (isActive && state?.pos.path && activeItem) {
      updateState({
        "filePanel.path": combine(state.pos.path, activeItem.name),
        "filePanel.activeName": activeItem.name,
        "filePanel.isFileActive": activeItem.isFile ?? false,
        "filePanel.isDirectoryActive": activeItem.isDir ?? false,
      });
      panelRef.current?.focus();
    }
  }, [updateState, isActive, activeItem, state?.pos.path]);

  useLayoutEffect(() => {
    const { path, id } = layout;
    const pos = { path, cursor: {} };
    initPanelState(id, { items: createList(), selectedItems: empty<string>(), pos, targetPos: pos, stack: [] });
  }, [initPanelState, layout]);

  // FIXME: If "ready" event is not fired by the filesystem watcher, we should add ".." directory
  // Below code is invalid because it breaks the cursor position when navigating to parent directory.

  // useEffect(() => {
  //   const path = state?.path;
  //   if (path && !isRoot(path)) {
  //     dispatch(setPanelItems({ id, items: list({ name: "..", isDir: true }) }));
  //   }
  // }, [dispatch, id, state?.path]);

  useDirListing(
    state?.targetPos?.path,
    useCallback(
      (dirPath, files) => {
        files = files.sort(fsCompare);
        if (!isRoot(dirPath)) {
          files = files.unshift({ name: "..", isDir: true });
        }
        setPanelItems(id, files);
      },
      [id, setPanelItems],
    ),
  );

  const onFocus = useCallback(() => setActivePanelId(id), [id, setActivePanelId]);

  const selectionType = useRef<boolean>();
  const onCursorPositionChange = useCallback(
    (targetCursor: CursorPosition, select: boolean) => {
      if (select) {
        if (selectionType.current == null) {
          selectionType.current = selectedItems.findIndex((i) => i === cursor.activeName) < 0;
        }
        const isSelection = selectionType.current;
        let minIndex = 0;
        let maxIndex = 0;
        const sourceIdx = cursor.activeIndex ?? 0;
        const targetIdx = targetCursor.activeIndex ?? 0;

        if (sourceIdx < targetIdx) {
          minIndex = sourceIdx;
          maxIndex = targetIdx;
        } else {
          minIndex = targetIdx + 1;
          maxIndex = sourceIdx + 1;
        }
        const selectedNames = items.slice(minIndex, maxIndex).map((i) => i.name);
        setPanelSelectedItems(id, Array.from(selectedNames), isSelection);
      } else {
        selectionType.current = undefined;
      }
      setPanelCursorPos(id, targetCursor);
    },
    [id, setPanelCursorPos, setPanelSelectedItems, selectedItems, cursor, items],
  );

  const onSelectItems = useCallback(
    (itemNames: string[], select: boolean) => {
      setPanelSelectedItems(id, itemNames, select);
    },
    [id, setPanelSelectedItems],
  );

  return (
    <div
      className={css("redux-file-panel-root")}
      onKeyDown={() => {
        selectionType.current = undefined;
      }}
    >
      <ContextVariablesProvider>
        <FilePanel
          ref={panelRef}
          selectedItemNames={selectedItems}
          showCursorWhenBlurred={isActive}
          onFocus={onFocus}
          onCursorPositionChange={onCursorPositionChange}
          onSelectItems={onSelectItems}
          cursor={cursor}
          items={items}
          path={state ? state.pos.path : "/"}
          view={layout.view}
        />
        <DebugContextVariables />
      </ContextVariablesProvider>
    </div>
  );
});
