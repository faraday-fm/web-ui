import { produce } from "immer";
import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import type { FilePanelLayout, PanelLayout, PanelsLayout } from "../../types";
import { createList, type List } from "../../utils/immutableList";
import { traverseLayout, traverseLayoutRows } from "../../utils/layout";
import { combine, truncateLastDir } from "../../utils/path";
import { type Dirent, FileType } from "../fs/types";
import type { CursorPosition, PanelState } from "./types";
import { isDir } from "../fs/utils";

const activePanelAtom = atom<PanelLayout>();
const activeFilePanelAtom = atom<FilePanelLayout>();
const layoutAtom = atom<PanelsLayout>();
const statesAtom = atom<Record<string, PanelState | undefined>>({});

export function usePanels() {
  const [layout, setLayout] = useAtom(layoutAtom);
  const [states, setStates] = useAtom(statesAtom);
  const [activePanel, setActivePanel] = useAtom(activePanelAtom);
  const [activeFilePanel, setActiveFilePanel] = useAtom(activeFilePanelAtom);

  const resizeChildren = useCallback(
    (id: string, flexes: number[]) =>
      setLayout(
        produce((s) => {
          if (s) {
            traverseLayoutRows(s, (panel) => {
              if (panel.id === id) {
                panel.children.forEach((child, idx) => (child.flex = flexes[idx]));
              }
            });
          }
        }),
      ),
    [setLayout],
  );

  const setActivePanelId = useCallback(
    (activePanelId: string) => {
      if (layout) {
        traverseLayout(layout, (panel) => {
          if (panel.id === activePanelId) {
            setActivePanel(panel);
            if (panel.type === "file-panel") {
              setActiveFilePanel(panel);
            }
          }
        });
      }
    },
    [layout, setActivePanel, setActiveFilePanel],
  );

  const initPanelState = useCallback(
    (id: string, state: PanelState) =>
      setStates(
        produce((s) => {
          if (!s[id]) {
            s[id] = state;
          }
        }),
      ),
    [setStates],
  );

  const setPanelItems = useCallback(
    (id: string, items: List<Dirent>) =>
      setStates(
        produce((s) => {
          const state = s[id];
          if (!state?.targetPos) {
            return;
          }
          state.items = items;
          state.pos = state.targetPos;
          state.stack.push(state.pos);
        }),
      ),
    [setStates],
  );

  const setPanelSelectedItems = useCallback(
    (id: string, itemNames: string[], select: boolean) =>
      setStates(
        produce((s) => {
          const state = s[id];
          if (!state) {
            return;
          }
          const newItems = select ? new Set(state.selectedItems).union(new Set(itemNames)) : new Set(state.selectedItems).difference(new Set(itemNames));
          state.selectedItems = createList(newItems);
        }),
      ),
    [setStates],
  );

  const setPanelCursorPos = useCallback(
    (id: string, cursorPos: CursorPosition) =>
      setStates(
        produce((s) => {
          const state = s[id];
          if (!state) {
            return;
          }
          state.pos.cursor = cursorPos;
          const pos = state.stack.at(-1);
          if (pos) {
            pos.cursor = cursorPos;
          }
        }),
      ),
    [setStates],
  );

  const focusNextPanel = useCallback(
    (backward: boolean) => {
      if (layout) {
        let lastTraversedPanel: PanelLayout | undefined;
        let newActivePanelSet = false;
        traverseLayout(
          layout,
          (panel) => {
            if (lastTraversedPanel && !newActivePanelSet && panel.id === activePanel?.id) {
              setActivePanelId(lastTraversedPanel.id);
              newActivePanelSet = true;
            }
            lastTraversedPanel = panel;
          },
          !backward,
        );
        if (!newActivePanelSet && lastTraversedPanel) {
          setActivePanelId(lastTraversedPanel.id);
        }
      }
    },
    [layout, activePanel, setActivePanelId],
  );

  const enterDir = useCallback(
    () =>
      setStates(
        produce((s) => {
          if (!layout) return;
          if (!activeFilePanel) {
            return;
          }
          const state = s[activeFilePanel.id];
          if (!state) {
            return;
          }

          const cursor = state.stack.at(-1);
          const activeItemPos = cursor?.cursor.activeIndex ?? 0;
          const activeItem = state.items.get(activeItemPos);
          if (activeItem && isDir(activeItem)) {
            if (activeItem.filename === "..") {
              const targetPath = truncateLastDir(state.pos.path);
              if (targetPath === state.pos.path) {
                return;
              }
              state.stack.pop();
              const targetPos = state.stack.pop();
              state.targetPos = {
                path: targetPath,
                cursor: targetPos?.cursor ?? {},
              };
            } else {
              state.targetPos = {
                path: combine(state.pos.path, activeItem.filename),
                cursor: {},
              };
            }
          }
        }),
      ),
    [layout, activeFilePanel, setStates],
  );

  return {
    layout,
    states,
    activePanel,
    activeFilePanel,
    setPanelsLayout: setLayout,
    resizeChildren,
    setActivePanelId,
    initPanelState,
    setPanelItems,
    setPanelSelectedItems,
    setPanelCursorPos,
    focusNextPanel,
    enterDir,
  };
}

export function usePanelState(id: string) {
  return usePanels().states[id];
}
