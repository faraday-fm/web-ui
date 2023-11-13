import { FsEntry } from "../../features/fs/types";
import { FilePanelLayout, PanelLayout, PanelsLayout } from "../../types";
import { ImmerStateCreator } from "../../utils/immer";
import { List } from "../../utils/immutableList";
import { traverseLayout, traverseLayoutRows } from "../../utils/layout";
import { combine, truncateLastDir } from "../../utils/path";
import { CursorPosition, PanelState } from "./types";

interface State {
  activePanel?: PanelLayout;
  activeFilePanel?: FilePanelLayout;
  layout?: PanelsLayout;
  states: Record<string, PanelState | undefined>;
}

interface Actions {
  setPanelsLayout(layout: PanelsLayout): void;
  resizeChildren(id: string, flexes: number[]): void;
  setActivePanel(activePanelId: string): void;
  initPanelState(id: string, state: PanelState): void;
  setPanelItems(id: string, items: List<FsEntry>): void;
  setPanelCursorPos(id: string, cursorPos: CursorPosition): void;
  focusNextPanel(backward: boolean): void;
  enterDir(): void;
  dirUp(id: string): void;
}

export type PanelsSlice = State & Actions;

export const createPanelsSlice: ImmerStateCreator<PanelsSlice> = (set) => ({
  states: {} as Record<string, PanelState | undefined>,

  setPanelsLayout: (layout) => set({ layout }),
  resizeChildren: (id, flexes) =>
    set((s) => {
      if (s.layout) {
        traverseLayoutRows(s.layout, (panel) => {
          if (panel.id === id) {
            panel.children.forEach((child, idx) => (child.flex = flexes[idx]));
          }
        });
      }
    }),
  setActivePanel: (activePanelId) =>
    set((s) => {
      if (s.layout) {
        traverseLayout(s.layout, (panel) => {
          if (panel.id === activePanelId) {
            s.activePanel = panel;
            if (panel.type === "file-panel") {
              s.activeFilePanel = panel;
            }
          }
        });
      }
    }),
  initPanelState: (id, state) =>
    set((s) => {
      if (!s.states[id]) {
        s.states[id] = state;
      }
    }),
  setPanelItems: (id, items) =>
    set((s) => {
      const state = s.states[id];
      if (!state?.targetPos) {
        return;
      }
      state.items = items;
      state.pos = state.targetPos;
      state.stack.push(state.pos);
    }),
  setPanelCursorPos: (id, cursorPos) =>
    set((s) => {
      const state = s.states[id];
      if (!state) {
        return;
      }
      state.pos.cursor = cursorPos;
      const pos = state.stack.at(-1);
      if (pos) {
        pos.cursor = cursorPos;
      }
    }),
  focusNextPanel: (backward) =>
    set((s) => {
      if (s.layout) {
        let lastTraversedPanel: PanelLayout | undefined;
        let newActivePanelSet = false;
        traverseLayout(
          s.layout,
          (panel) => {
            if (lastTraversedPanel && !newActivePanelSet && panel.id === s.activePanel?.id) {
              s.activePanel = lastTraversedPanel;
              newActivePanelSet = true;
            }
            lastTraversedPanel = panel;
          },
          !backward
        );
        if (!newActivePanelSet && lastTraversedPanel) {
          s.activePanel = lastTraversedPanel;
        }
        if (s.activePanel?.type === "file-panel") {
          s.activeFilePanel = s.activePanel;
        }
      }
    }),
  enterDir: () =>
    set((s) => {
      if (!s.layout) return;
      if (!s.activeFilePanel) {
        return;
      }
      const state = s.states[s.activeFilePanel.id];
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
          state.targetPos = { path: targetPath, cursor: targetPos?.cursor ?? {} };
        } else {
          state.targetPos = { path: combine(state.pos.path, selectedItem.name), cursor: {} };
        }
      }
    }),
  dirUp: (id) =>
    set((s) => {
      if (!s.layout) return;
      const state = s.states[id];
      if (!state) {
        return;
      }

      const targetPath = truncateLastDir(state.pos.path);
      if (targetPath === state.pos.path) {
        return;
      }
      state.stack.pop();
      const targetPos = state.stack.pop();
      state.targetPos = { path: targetPos?.path ?? targetPath, cursor: targetPos?.cursor ?? {} };
    }),
});
