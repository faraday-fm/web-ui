import { FilePanel, FilePanelActions } from "@components/panels/FilePanel/FilePanel";
import { FsEntry } from "@features/fs/types";
import { CursorPosition, initPanelState, popDir, setActivePanel, setPanelCursorPos, setPanelItems } from "@features/panels/panelsSlice";
import { useDirListing } from "@hooks/useDirListing";
import { selectPanelState, useAppDispatch, useAppSelector } from "@store";
import { FilePanelLayout } from "@types";
import { isRoot } from "@utils/urlUtils";
import { empty, list, Ordering } from "list";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import styled from "styled-components";

type ReduxFilePanelProps = { layout: FilePanelLayout & { id: string } };

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

export function ReduxFilePanel({ layout }: ReduxFilePanelProps) {
  const { id } = layout;
  const dispatch = useAppDispatch();
  const panelRef = useRef<FilePanelActions>(null);
  const isActive = useAppSelector((state) => state.panels.activePanelId === id);
  const state = useAppSelector(selectPanelState(id));

  const items = state?.items ?? empty();
  const cursor = state?.cursor ?? {};
  const view = state?.view ?? layout.view;

  useEffect(() => {
    if (isActive) {
      panelRef.current?.focus();
    }
  }, [isActive]);

  useEffect(() => {
    const { path, id, view } = layout;
    dispatch(initPanelState({ id, state: { view, cursor: {}, items: empty(), path } }));
  }, [dispatch, layout]);

  useEffect(() => {
    const path = state?.path;
    if (path && !isRoot(path)) {
      dispatch(setPanelItems({ id, items: list({ name: "..", isDir: true }) }));
    }
  }, [dispatch, id, state?.path]);

  useDirListing(
    state?.path,
    useCallback(
      (dirPath, files) => {
        files = files.sortWith(fsCompare);
        if (!isRoot(dirPath)) {
          files = files.prepend({ name: "..", isDir: true });
        }
        dispatch(setPanelItems({ id, items: files }));
      },
      [dispatch, id]
    )
  );

  const onCursorPositionChange = useCallback(
    (cursorPos: CursorPosition) => {
      dispatch(setPanelCursorPos({ id, cursorPos }));
    },
    [dispatch, id]
  );

  return (
    <Root>
      <FilePanel
        ref={panelRef}
        showCursorWhenBlurred={isActive}
        onFocus={() => dispatch(setActivePanel(id))}
        onCursorPositionChange={onCursorPositionChange}
        onDirUp={() => dispatch(popDir(id))}
        cursor={cursor}
        items={items}
        path={state ? state.path : "file:/"}
        view={view}
      />
    </Root>
  );
}
