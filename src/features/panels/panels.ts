import { produce } from "immer";
import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import type { FsEntry } from "../../features/fs/types";
import type { FilePanelLayout, PanelLayout, PanelsLayout } from "../../types";
import type { List } from "../../utils/immutableList";
import { traverseLayout, traverseLayoutRows } from "../../utils/layout";
import { combine, truncateLastDir } from "../../utils/path";
import type { CursorPosition, PanelState } from "./types";

interface State {
  activePanel?: PanelLayout;
  activeFilePanel?: FilePanelLayout;
  layout?: PanelsLayout;
  states: Record<string, PanelState | undefined>;
}

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
    (id: string, items: List<FsEntry>) =>
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
          const selectedItemPos = cursor?.cursor.selectedIndex ?? 0;
          const selectedItem = state.items.get(selectedItemPos);
          if (selectedItem?.isDir) {
            if (selectedItem.name === "..") {
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
                path: combine(state.pos.path, selectedItem.name),
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
    setPanelCursorPos,
    focusNextPanel,
    enterDir,
  };
}

export function usePanelState(id: string) {
  return usePanels().states[id];
}

// interface Actions {
// 	setPanelsLayout(layout: PanelsLayout): void;
// 	resizeChildren(id: string, flexes: number[]): void;
// 	setActivePanel(activePanelId: string): void;
// 	initPanelState(id: string, state: PanelState): void;
// 	setPanelItems(id: string, items: List<FsEntry>): void;
// 	setPanelCursorPos(id: string, cursorPos: CursorPosition): void;
// 	focusNextPanel(backward: boolean): void;
// 	enterDir(): void;
// 	dirUp(id: string): void;
// }

// export type PanelsSlice = State & Actions;

// export const createPanelsSlice: ImmerStateCreator<PanelsSlice> = (set) => ({
// 	states: {} as Record<string, PanelState | undefined>,

// 	setPanelCursorPos: (id, cursorPos) =>
// 		set((s) => {
// 			const state = s.states[id];
// 			if (!state) {
// 				return;
// 			}
// 			state.pos.cursor = cursorPos;
// 			const pos = state.stack.at(-1);
// 			if (pos) {
// 				pos.cursor = cursorPos;
// 			}
// 		}),
// 	focusNextPanel: (backward) =>
// 		set((s) => {
// 			if (s.layout) {
// 				let lastTraversedPanel: PanelLayout | undefined;
// 				let newActivePanelSet = false;
// 				traverseLayout(
// 					s.layout,
// 					(panel) => {
// 						if (
// 							lastTraversedPanel &&
// 							!newActivePanelSet &&
// 							panel.id === s.activePanel?.id
// 						) {
// 							s.activePanel = lastTraversedPanel;
// 							newActivePanelSet = true;
// 						}
// 						lastTraversedPanel = panel;
// 					},
// 					!backward,
// 				);
// 				if (!newActivePanelSet && lastTraversedPanel) {
// 					s.activePanel = lastTraversedPanel;
// 				}
// 				if (s.activePanel?.type === "file-panel") {
// 					s.activeFilePanel = s.activePanel;
// 				}
// 			}
// 		}),
// 	enterDir: () =>
// 		set((s) => {
// 			if (!s.layout) return;
// 			if (!s.activeFilePanel) {
// 				return;
// 			}
// 			const state = s.states[s.activeFilePanel.id];
// 			if (!state) {
// 				return;
// 			}

// 			const cursor = state.stack.at(-1);
// 			const selectedItemPos = cursor?.cursor.selectedIndex ?? 0;
// 			const selectedItem = state.items.get(selectedItemPos);
// 			if (selectedItem?.isDir) {
// 				if (selectedItem.name === "..") {
// 					const targetPath = truncateLastDir(state.pos.path);
// 					if (targetPath === state.pos.path) {
// 						return;
// 					}
// 					state.stack.pop();
// 					const targetPos = state.stack.pop();
// 					state.targetPos = {
// 						path: targetPath,
// 						cursor: targetPos?.cursor ?? {},
// 					};
// 				} else {
// 					state.targetPos = {
// 						path: combine(state.pos.path, selectedItem.name),
// 						cursor: {},
// 					};
// 				}
// 			}
// 		}),
// 	dirUp: (id) =>
// 		set((s) => {
// 			if (!s.layout) return;
// 			const state = s.states[id];
// 			if (!state) {
// 				return;
// 			}

// 			const targetPath = truncateLastDir(state.pos.path);
// 			if (targetPath === state.pos.path) {
// 				return;
// 			}
// 			state.stack.pop();
// 			const targetPos = state.stack.pop();
// 			state.targetPos = {
// 				path: targetPos?.path ?? targetPath,
// 				cursor: targetPos?.cursor ?? {},
// 			};
// 		}),
// });
