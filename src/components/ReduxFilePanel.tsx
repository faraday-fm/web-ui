import { FilePanel, FilePanelActions } from "@components/panels/FilePanel/FilePanel";
import styled from "@emotion/styled";
import { useDirListing } from "@features/fs/hooks";
import { FsEntry } from "@features/fs/types";
import { useGlobalContext } from "@features/globalContext";
import { CursorPosition, usePanelState, usePanels } from "@features/panels";
import { FilePanelLayout } from "@types";
import { combine, isRoot } from "@utils/path";
import { empty, type Ordering } from "list";
import { memo, useCallback, useEffect, useRef } from "react";

interface ReduxFilePanelProps {
  layout: FilePanelLayout & { id: string };
}

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const collator = new Intl.Collator(undefined, { numeric: true, usage: "sort", sensitivity: "case" });

function fsCompare(a: FsEntry, b: FsEntry): Ordering {
  if (a.isDir && !b.isDir) return -1;
  if (!a.isDir && b.isDir) return 1;
  return collator.compare(a.name, b.name) as Ordering;
}

export const ReduxFilePanel = memo(function ReduxFilePanel({ layout }: ReduxFilePanelProps) {
  const { id } = layout;
  const panelRef = useRef<FilePanelActions>(null);
  const { activePanelId, initPanelState, setPanelItems, setPanelCursorPos, setActivePanel, popDir } = usePanels();
  const state = usePanelState(id);
  const globalContext = useGlobalContext();
  const isActive = activePanelId === id;

  const items = state?.items ?? empty();
  const cursor = state?.cursor ?? {};
  const selectedItem = state?.items ? state.items.nth(cursor.selectedIndex ?? 0) : undefined;

  useEffect(() => {
    if (isActive && state?.path && selectedItem) {
      globalContext.updateState({
        "filePanel.selectedPath": combine(state.path, selectedItem.name),
        "filePanel.selectedName": selectedItem.name,
        "filePanel.isFileSelected": selectedItem.isFile ?? false,
        "filePanel.isDirectorySelected": selectedItem.isDir ?? false,
      });
      panelRef.current?.focus();
    }
  }, [globalContext, isActive, selectedItem, state?.path]);

  useEffect(() => {
    const { path, id } = layout;
    initPanelState(id, { cursor: {}, items: empty(), path });
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
    state?.path,
    useCallback(
      (dirPath, files) => {
        files = files.sortWith(fsCompare);
        if (!isRoot(dirPath)) {
          files = files.prepend({ name: "..", isDir: true });
        }
        setPanelItems(id, files);
      },
      [id, setPanelItems]
    )
  );

  const onFocus = useCallback(() => setActivePanel(id), [id, setActivePanel]);
  const onDirUp = useCallback(() => popDir(id), [id, popDir]);

  const onCursorPositionChange = useCallback(
    (cursorPos: CursorPosition) => {
      setPanelCursorPos(id, cursorPos);
    },
    [id, setPanelCursorPos]
  );

  return (
    <Root>
      <FilePanel
        ref={panelRef}
        showCursorWhenBlurred={isActive}
        onFocus={onFocus}
        onCursorPositionChange={onCursorPositionChange}
        onDirUp={onDirUp}
        cursor={cursor}
        items={items}
        path={state ? state.path : "file:/"}
        view={layout.view}
      />
    </Root>
  );
});
