import { memo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { ContextVariablesProvider, DebugContextVariables } from "../../features/commands";
import { useDirListing } from "../../features/fs/hooks";
import { FsEntry } from "../../features/fs/types";
import { useGlobalContext } from "../../store/globalContext";
import { css } from "../../features/styles";
import { FilePanelLayout } from "../../types";
import { createList } from "../../utils/immutableList";
import { combine, isRoot } from "../../utils/path";
import { FilePanel, FilePanelActions } from "./FilePanel/FilePanel";
import { usePanelState, usePanels } from "../../store/panels/hooks";
import { CursorPosition } from "../../store/panels/types";

interface StoreFilePanelProps {
  layout: FilePanelLayout & { id: string };
}

const collator = new Intl.Collator(undefined, { numeric: true, usage: "sort", sensitivity: "case" });

function fsCompare(a: FsEntry, b: FsEntry) {
  if (a.isDir && !b.isDir) return -1;
  if (!a.isDir && b.isDir) return 1;
  return collator.compare(a.name, b.name);
}

export const StoreFilePanel = memo(function StoreFilePanel({ layout }: StoreFilePanelProps) {
  const { id } = layout;
  const panelRef = useRef<FilePanelActions>(null);
  const { activeFilePanel, activePanel, initFilePanelState: initPanelState, setPanelItems, setPanelCursorPos, setActivePanel, dirUp } = usePanels();
  const state = usePanelState(id);
  const { updateState } = useGlobalContext();
  const isActive = activePanel?.id === id;

  const items = state?.items ?? createList();
  const cursor = state?.pos.cursor ?? {};
  const selectedItem = state?.items ? state.items.get(cursor.selectedIndex ?? 0) : undefined;
  useEffect(() => {
    if (isActive && state?.pos.path && selectedItem) {
      updateState({
        "filePanel.path": combine(state.pos.path, selectedItem.name),
        "filePanel.selectedName": selectedItem.name,
        "filePanel.isFileSelected": selectedItem.isFile ?? false,
        "filePanel.isDirectorySelected": selectedItem.isDir ?? false,
      });
      panelRef.current?.focus();
    }
  }, [isActive, selectedItem, state?.pos.path, updateState]);

  useLayoutEffect(() => {
    const { path, id } = layout;
    const pos = { path, cursor: {} };
    initPanelState(id, { items: createList(), pos, targetPos: pos, stack: [] });
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
      [id, setPanelItems]
    )
  );

  const onFocus = useCallback(() => setActivePanel(id), [id, setActivePanel]);
  const onDirUp = useCallback(() => dirUp(id), [id, dirUp]);

  const onCursorPositionChange = useCallback(
    (cursorPos: CursorPosition) => {
      setPanelCursorPos(id, cursorPos);
    },
    [id, setPanelCursorPos]
  );

  return (
    <div className={css("redux-file-panel-root")}>
      <ContextVariablesProvider>
        <FilePanel
          ref={panelRef}
          showCursorWhenBlurred={activeFilePanel?.id === id}
          onFocus={onFocus}
          onCursorPositionChange={onCursorPositionChange}
          onDirUp={onDirUp}
          cursor={cursor}
          items={items}
          path={state ? state.pos.path : "file:/"}
          view={layout.view}
        />
        <DebugContextVariables />
      </ContextVariablesProvider>
    </div>
  );
});
