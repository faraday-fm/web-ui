import { FilePanel, FilePanelActions } from "@components/panels/FilePanel/FilePanel";
import { FileChangeType, FsEntry } from "@features/fs/types";
import { popDir, setActivePanel, setPanelCursorPos, setPanelItems, setPanelState } from "@features/panels/panelsSlice";
import { useFs } from "@hooks/useFs";
import { selectPanelState, useAppDispatch, useAppSelector } from "@store";
import { FilePanelLayout } from "@types";
import { getEntryName, isRoot } from "@utils/urlUtils";
import { empty, list, Ordering } from "list";
import { useCallback, useEffect, useRef } from "react";
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
  const fs = useFs();
  const isActive = useAppSelector((state) => state.panels.activePanelId === id);
  const state = useAppSelector(selectPanelState(id));

  const items = state?.items ?? empty();
  const cursorPos = state?.cursorPos ?? { selected: 0, topmost: 0 };
  const view = state?.view ?? layout.view;

  useEffect(() => {
    if (isActive) {
      panelRef.current?.focus();
    }
  }, [isActive]);

  useEffect(() => {
    const { path, id, view } = layout;
    dispatch(setPanelState({ id, state: { view, cursorPos: { selected: 0, topmost: 0 }, items: empty(), url: path } }));
  }, [dispatch, layout]);

  useEffect(() => {
    const url = state?.url;
    if (!url) return undefined;

    const abortController = new AbortController();
    (async () => {
      try {
        // const entries = await fs.readDirectory(url);
        let watchItems = empty<FsEntry>();
        let timeoutId: number;
        const updateItems = () => {
          let items = watchItems.sortWith(fsCompare);
          if (!isRoot(url)) {
            items = items.prepend({ name: "..", isDir: true });
          }
          dispatch(setPanelItems({ id, items }));
        };
        await fs.watch(
          url,
          (changes) => {
            changes.forEach((change) => {
              if (change.type === "ready") {
                updateItems();
              } else {
                const name = getEntryName(change.url);
                if (!name) return;
                switch (change.type) {
                  case FileChangeType.Created:
                    watchItems = watchItems.append(change.entry);
                    break;
                  case FileChangeType.Deleted:
                    const idx = watchItems.findIndex((e) => e.name === name);
                    if (idx >= 0) {
                      watchItems = watchItems.remove(idx, 1);
                    }
                    break;
                }
                clearTimeout(timeoutId);
                timeoutId = setTimeout(updateItems, 0);
              }
            });
          },
          { recursive: false, excludes: [], signal: abortController.signal }
        );
      } catch (err) {
        console.error(err);
        const items = list({ name: "..", isDir: true });
        dispatch(setPanelItems({ id, items }));
      }
    })();
    return () => abortController.abort();
  }, [dispatch, fs, id, state?.url]);

  const onCursorPositionChange = useCallback(
    (newTopMostPos: number, newCursorPos: number) => {
      dispatch(setPanelCursorPos({ id, cursorPos: { selected: newCursorPos, topmost: newTopMostPos } }));
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
        cursorPos={cursorPos.selected}
        topMostPos={cursorPos.topmost}
        items={items}
        path={state ? state.url : "file:/"}
        view={view}
      />
    </Root>
  );
}
