import { FilePanel, FilePanelActions } from "@components/panels/FilePanel/FilePanel";
import { setActivePanel, setPanelColumnsCount, setPanelCursorPos, setPanelItems, setPanelState } from "@features/panels/panelsSlice";
import { useFs } from "@hooks/useFs";
import { useAppDispatch, useAppSelector } from "@store";
import { FilePanelLayout, FsEntry } from "@types";
import { useCallback, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import useResizeObserver from "use-resize-observer";

type ReduxFilePanelProps = { layout: FilePanelLayout & { id: string } };

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const collator = new Intl.Collator(undefined, { numeric: true, usage: "sort", sensitivity: "case" });

function fsSort(a: FsEntry, b: FsEntry) {
  if (a.isDir && !b.isDir) return -1;
  if (!a.isDir && b.isDir) return 1;
  return collator.compare(a.name, b.name);
}

export function ReduxFilePanel({ layout }: ReduxFilePanelProps) {
  const { path, id } = layout;
  const dispatch = useAppDispatch();
  const panelRef = useRef<FilePanelActions>(null);
  const fs = useFs();
  const isActive = useAppSelector((state) => state.panels.activePanelId === id);
  const state = useAppSelector((state) => state.panels.states[id]);

  const items = state?.items ?? [];
  const cursorPos = state?.cursorPos ?? { selected: 0, topmost: 0 };
  const view = state?.view ?? layout.view;

  const { ref: rootRef, width } = useResizeObserver();

  const columnsCount = width ? Math.ceil(width / 350) : undefined;

  useEffect(() => {
    if (view.type === "condensed" && columnsCount) {
      dispatch(setPanelColumnsCount({ id, columnsCount }));
    }
  }, [columnsCount, dispatch, id, view.type]);

  useEffect(() => {
    if (isActive) {
      panelRef.current?.focus();
    }
  }, [isActive]);

  useEffect(() => {
    dispatch(setPanelState({ id, state: { view: layout.view, cursorPos: { selected: 0, topmost: 0 }, items: [], path } }));
  }, [dispatch, id, layout.view, path]);

  useEffect(() => {
    (async () => {
      if (path) {
        try {
          const entries = await fs.readDirectory(path);
          const items = Array.from(entries).sort(fsSort);
          if (new URL(path).pathname !== "/") {
            items.unshift({ name: "..", isDir: true });
          }
          dispatch(setPanelItems({ id, path, items, cursorPos: { selected: 0, topmost: 0 } }));
        } catch (err) {
          console.error(err);
        }
      }
    })();
  }, [dispatch, fs, id, path]);

  const onCursorPositionChange = useCallback(
    (newTopMostPos: number, newCursorPos: number) => {
      dispatch(setPanelCursorPos({ id, cursorPos: { selected: newCursorPos, topmost: newTopMostPos } }));
    },
    [dispatch, id]
  );

  return (
    <Root ref={rootRef}>
      <FilePanel
        ref={panelRef}
        showCursorWhenBlurred={isActive}
        onFocus={() => dispatch(setActivePanel(id))}
        onCursorPositionChange={onCursorPositionChange}
        cursorPos={cursorPos.selected}
        topMostPos={cursorPos.topmost}
        items={items}
        title={decodeURI(new URL(path).pathname)}
        view={view}
      />
    </Root>
  );
}
