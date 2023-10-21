import { FsEntry } from "@features/fs/types";
import { PanelsLayout } from "@types";
import { traverseLayout } from "@utils/layout";
import { combine, truncateLastDir } from "@utils/path";
import { empty, List } from "list";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface CursorPosition {
  selectedName?: string;
  selectedIndex?: number;
  topmostName?: string;
  topmostIndex?: number;
}

export interface PanelState {
  path: string;
  items: List<FsEntry>;
  cursor: CursorPosition;
}

interface State {
  activePanelId?: string;
  layout?: PanelsLayout;
  states: Record<string, PanelState[] | undefined>;
}

interface Actions {
  setPanelsLayout(layout: PanelsLayout): void;
  setActivePanel(activePanelId: string): void;
  initPanelState(id: string, state: PanelState): void;
  setPanelItems(id: string, items: List<FsEntry>): void;
  setPanelCursorPos(id: string, cursorPos: CursorPosition): void;
  focusNextPanel(backward: boolean): void;
  focusPrevPanel(): void;
  changeDir(): void;
  popDir(id: string): void;
}

/** @internal */
export const usePanels = create(
  immer<State & Actions>((set) => ({
    activePanelId: undefined as string | undefined,
    layout: undefined as PanelsLayout | undefined,
    states: {} as Record<string, PanelState[] | undefined>,

    setPanelsLayout: (layout) => set({ layout }),
    setActivePanel: (activePanelId) => set({ activePanelId }),
    initPanelState: (id, state) =>
      set((s) => {
        if (!s.states[id]) {
          s.states[id] = [state];
        }
      }),
    setPanelItems: (id, items) =>
      set((s) => {
        const panelsStack = s.states[id];
        if (panelsStack && panelsStack.length > 0) {
          const ps = panelsStack[panelsStack.length - 1];
          ps.items = items;
          if (ps.cursor.selectedIndex && ps.cursor.selectedIndex >= ps.items.length) {
            ps.cursor.selectedIndex = ps.items.length - 1;
            ps.cursor.selectedName = ps.items.nth(ps.cursor.selectedIndex)?.name;
          }
        }
      }),
    setPanelCursorPos: (id, cursorPos) =>
      set((s) => {
        const panelsStack = s.states[id];
        if (panelsStack && panelsStack.length > 0) {
          const s = panelsStack[panelsStack.length - 1];
          s.cursor = cursorPos;
        }
      }),
    focusNextPanel: (backward) =>
      set((s) => {
        if (s.layout) {
          let lastPanelId: string | undefined;
          let newActivePanelSet = false;
          traverseLayout(
            s.layout,
            (panel) => {
              if (lastPanelId && !newActivePanelSet && panel.id === s.activePanelId) {
                s.activePanelId = lastPanelId;
                newActivePanelSet = true;
              }
              lastPanelId = panel.id;
            },
            !backward
          );
          if (!newActivePanelSet && lastPanelId) {
            s.activePanelId = lastPanelId;
          }
        }
      }),
    focusPrevPanel: () =>
      set((s) => {
        if (s.layout) {
          let lastPanelId: string | undefined;
          let newActivePanelSet = false;
          traverseLayout(s.layout, (panel) => {
            if (lastPanelId && !newActivePanelSet && panel.id === s.activePanelId) {
              s.activePanelId = lastPanelId;
              newActivePanelSet = true;
            }
            lastPanelId = panel.id;
          });
          if (!newActivePanelSet && lastPanelId) {
            s.activePanelId = lastPanelId;
          }
        }
      }),
    changeDir: () =>
      set((s) => {
        if (!s.layout) return;
        traverseLayout(s.layout, (panel) => {
          if (panel.type === "file-panel" && panel.id === s.activePanelId) {
            const panelsStack = s.states[panel.id];
            if (panelsStack) {
              const s = panelsStack[panelsStack.length - 1];
              const selectedItemPos = s.cursor.selectedIndex ?? 0;
              const selectedItem = s.items.nth(selectedItemPos);
              if (selectedItem?.isDir) {
                if (selectedItem.name === "..") {
                  if (panelsStack.length > 1) {
                    panelsStack.pop();
                  } else {
                    s.path = truncateLastDir(s.path);
                  }
                } else {
                  panelsStack.push({
                    path: combine(s.path, selectedItem.name),
                    cursor: {},
                    items: empty(),
                  });
                }
              }
            }
          }
        });
      }),
    popDir: (id) =>
      set((s) => {
        if (!s.layout) return;
        const panelsStack = s.states[id];
        if (panelsStack) {
          if (panelsStack.length > 1) {
            panelsStack.pop();
          } else {
            const s = panelsStack[panelsStack.length - 1];
            s.path = truncateLastDir(s.path);
            s.cursor.selectedIndex = 0;
          }
        }
      }),
  }))
);

export function usePanelState(id: string) {
  return usePanels().states[id]?.at(-1);
}
