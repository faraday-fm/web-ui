import { memo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { FilePanel, type FilePanelActions } from "../components/panels/FilePanel/FilePanel";
import { ContextVariablesProvider, DebugContextVariables, useCommandBindings } from "../features/commands";
import { useDirListing } from "../features/fs/hooks";
import type { Dirent } from "../features/fs/types";
import { isDir } from "../features/fs/utils";
import { useGlobalContext } from "../features/globalContext";
import { type CursorPosition, usePanelState, usePanels } from "../features/panels";
import { css } from "../features/styles";
import type { FilePanelLayout } from "../types";
import { createList, empty } from "../utils/immutableList";
import { combine } from "../utils/path";
import { useFocused } from "../hooks/useFocused";

interface ReduxFilePanelProps {
  layout: FilePanelLayout & { id: string };
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  usage: "sort",
  sensitivity: "case",
});

function fsCompare(a: Dirent, b: Dirent) {
  if (isDir(a) && !isDir(b)) return -1;
  if (!isDir(a) && isDir(b)) return 1;
  return collator.compare(a.filename, b.filename);
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
        "filePanel.path": combine(state.pos.path, activeItem.filename),
        "filePanel.activeName": activeItem.filename,
        "filePanel.isFileActive": !isDir(activeItem),
        "filePanel.isDirectoryActive": isDir(activeItem),
      });
      panelRef.current?.focus();
    }
  }, [updateState, isActive, activeItem, state?.pos.path]);

  useLayoutEffect(() => {
    const { path, id } = layout;
    const pos = { path, cursor: {} };
    initPanelState(id, { items: createList(), selectedItems: empty<string>(), pos, targetPos: pos, stack: [] });
  }, [initPanelState, layout]);

  useDirListing(
    state?.targetPos?.path,
    useCallback(
      (_, files) => {
        files = files.sort(fsCompare);
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
        const selectedNames = items.slice(minIndex, maxIndex).map((i) => i.filename);
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
