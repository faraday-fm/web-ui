import { FilePanel, FilePanelActions } from "@components/panels/FilePanel/FilePanel";
import { useFarMoreHost } from "@contexts/farMoreHostContext";
import { setActivePanel, setPanelState } from "@features/panels/panelsSlice";
import { useAppDispatch, useAppSelector } from "@store";
import { CondensedView, FilePanelLayout, FsEntry } from "@types";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import styled from "styled-components";
import useResizeObserver from "use-resize-observer";

type ReduxFilePanelProps = { layout: FilePanelLayout & { id: string } };
type ReduxFilePanelActions = FilePanelActions;

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
`;

const collator = new Intl.Collator(undefined, { numeric: true, usage: "sort", sensitivity: "case" });

function fsSort(a: FsEntry, b: FsEntry) {
  if (a.isDir && !b.isDir) return -1;
  if (!a.isDir && b.isDir) return 1;
  return collator.compare(a.name, b.name);
}

export const ReduxFilePanel = forwardRef<ReduxFilePanelActions, ReduxFilePanelProps>(({ layout }, ref) => {
  const { path, id } = layout;
  const dispatch = useAppDispatch();
  const panelRef = useRef<FilePanelActions>(null);
  const host = useFarMoreHost();
  const isActive = useAppSelector((state) => state.panels.activePanelId === id);
  const state = useAppSelector((state) => state.panels.states[id]);
  const items = useMemo(() => state?.items ?? [], [state?.items]);
  const cursorPos = useMemo(() => state?.cursorPos ?? { selected: 0, topmost: 0 }, [state?.cursorPos]);

  const view = state?.view ?? layout.view;

  useImperativeHandle(ref, () => ({ focus: () => panelRef.current?.focus() }));

  const { ref: rootRef, width = 1 } = useResizeObserver();

  const columnsCount = Math.ceil(width / 350);

  useEffect(() => {
    if (view.type === "condensed" && columnsCount !== view.columnsCount) {
      dispatch(setPanelState({ id, state: { items, path, view: { ...view, columnsCount }, cursorPos } }));
    }
  }, [columnsCount, cursorPos, dispatch, id, items, path, view]);

  useEffect(() => {
    if (isActive) {
      panelRef.current?.focus();
    }
  }, [isActive]);

  useEffect(() => {
    (async () => {
      if (path) {
        try {
          const entries = await host.fs.readDirectory(new URL(`far-more:${path}`));
          const items = Array.from(entries).sort(fsSort);
          if (path !== "/") {
            items.unshift({ name: "..", isDir: true });
          }
          dispatch(setPanelState({ id, state: { items, path, view, cursorPos: { selected: 0, topmost: 0 } } }));
        } catch (err) {
          console.error(err);
        }
      }
    })();
  }, [dispatch, host, id, path, view]);

  const onCursorPositionChange = useCallback(
    (newTopMostPos: number, newCursorPos: number) => {
      dispatch(setPanelState({ id, state: { items, path, view, cursorPos: { selected: newCursorPos, topmost: newTopMostPos } } }));
    },
    [dispatch, id, items, path, view]
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
        title={path}
        view={view}
      />
    </Root>
  );
});
