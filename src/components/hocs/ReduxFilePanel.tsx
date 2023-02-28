import { FilePanel, FilePanelActions } from "@components/panels/FilePanel/FilePanel";
import { setActivePanel, setPanelCursorPos, setPanelItems, setPanelState } from "@features/panels/panelsSlice";
import { useFs } from "@hooks/useFs";
import { selectPanelState, useAppDispatch, useAppSelector } from "@store";
import { FilePanelLayout, FsEntry } from "@types";
import { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";

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
  const { id } = layout;
  const dispatch = useAppDispatch();
  const panelRef = useRef<FilePanelActions>(null);
  const fs = useFs();
  const isActive = useAppSelector((state) => state.panels.activePanelId === id);
  const state = useAppSelector(selectPanelState(id));

  const items = state?.items ?? [];
  const cursorPos = state?.cursorPos ?? { selected: 0, topmost: 0 };
  const view = state?.view ?? layout.view;

  useEffect(() => {
    if (isActive) {
      panelRef.current?.focus();
    }
  }, [isActive]);

  useEffect(() => {
    const { path, id, view } = layout;
    dispatch(setPanelState({ id, state: { view, cursorPos: { selected: 0, topmost: 0 }, items: [], path } }));
  }, [dispatch, layout]);

  useEffect(() => {
    (async () => {
      const path = state?.path;
      if (path) {
        try {
          const entries = await fs.readDirectory(path);
          const items = Array.from(entries).sort(fsSort);
          if (new URL(path).pathname !== "/") {
            items.unshift({ name: "..", isDir: true });
          }
          dispatch(setPanelItems({ id, items }));
        } catch (err) {
          console.error(err);
          const items = [{ name: "..", isDir: true }];
          dispatch(setPanelItems({ id, items }));
        }
      }
    })();
  }, [dispatch, fs, id, state?.path]);

  const onCursorPositionChange = useCallback(
    (newTopMostPos: number, newCursorPos: number) => {
      dispatch(setPanelCursorPos({ id, cursorPos: { selected: newCursorPos, topmost: newTopMostPos } }));
    },
    [dispatch, id]
  );

  if (!state) {
    return null;
  }

  return (
    <Root>
      <FilePanel
        ref={panelRef}
        showCursorWhenBlurred={isActive}
        onFocus={() => dispatch(setActivePanel(id))}
        onCursorPositionChange={onCursorPositionChange}
        cursorPos={cursorPos.selected}
        topMostPos={cursorPos.topmost}
        items={items}
        title={decodeURI(new URL(state.path).pathname)}
        view={view}
      />
    </Root>
  );
}
