import { FsEntry } from "@features/fs/types";
import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { FilePanelView, PanelsLayout } from "@types";
import { traverseLayout } from "@utils/layout";
import { append, truncateLastDir } from "@utils/urlUtils";

type CursorPosition = {
  selected: number;
  topmost: number;
};

export type PanelState = {
  path: string;
  items: FsEntry[];
  cursorPos: CursorPosition;
  view: FilePanelView;
};

type SliceState = {
  activePanelId?: string;
  layout?: PanelsLayout;
  states: Record<string, PanelState[] | undefined>;
};

const panelsSliceUT = createSlice({
  name: "panels",
  initialState: {
    states: {},
  } as SliceState,
  reducers: {
    setPanelsLayout(state, { payload }: PayloadAction<PanelsLayout>) {
      state.layout = payload;
    },
    setActivePanel(state, { payload }: PayloadAction<string>) {
      state.activePanelId = payload;
    },
    setPanelState(state, { payload }: PayloadAction<{ id: string; state: PanelState }>) {
      state.states[payload.id] = [payload.state];
    },
    setPanelItems(state, { payload: { id, items } }: PayloadAction<{ id: string; items: FsEntry[] }>) {
      const panelsStack = state.states[id];
      if (panelsStack && panelsStack.length > 0) {
        const s = panelsStack[panelsStack.length - 1];
        s.items = items;
      }
    },
    setPanelCursorPos(state, { payload: { id, cursorPos } }: PayloadAction<{ id: string; cursorPos: CursorPosition }>) {
      const panelsStack = state.states[id];
      if (panelsStack && panelsStack.length > 0) {
        const s = panelsStack[panelsStack.length - 1];
        s.cursorPos = cursorPos;
      }
    },
    focusNextPanel(state, { payload: { backward = false } }: PayloadAction<{ backward: boolean }>) {
      if (state.layout) {
        let lastPanelId: string | undefined;
        let newActivePanelSet = false;
        traverseLayout(
          state.layout,
          (panel) => {
            if (lastPanelId && !newActivePanelSet && panel.id === state.activePanelId) {
              state.activePanelId = lastPanelId;
              newActivePanelSet = true;
            }
            lastPanelId = panel.id;
          },
          !backward
        );
        if (!newActivePanelSet && lastPanelId) {
          state.activePanelId = lastPanelId;
        }
      }
    },
    focusPrevPanel(state) {
      if (state.layout) {
        let lastPanelId: string | undefined;
        let newActivePanelSet = false;
        traverseLayout(state.layout, (panel) => {
          if (lastPanelId && !newActivePanelSet && panel.id === state.activePanelId) {
            state.activePanelId = lastPanelId;
            newActivePanelSet = true;
          }
          lastPanelId = panel.id;
        });
        if (!newActivePanelSet && lastPanelId) {
          state.activePanelId = lastPanelId;
        }
      }
    },
    changeDir(state) {
      if (!state.layout) return;
      traverseLayout(state.layout, (panel) => {
        if (panel.type === "file-panel" && panel.id === state.activePanelId) {
          const panelsStack = state.states[panel.id];
          if (panelsStack) {
            const s = panelsStack[panelsStack.length - 1];
            const selectedItemPos = s.cursorPos.selected;
            const selectedItem = s.items[selectedItemPos];
            if (selectedItem.isDir) {
              if (selectedItem.name === "..") {
                if (panelsStack.length > 1) {
                  panelsStack.pop();
                } else {
                  s.path = truncateLastDir(s.path).href;
                }
              } else {
                panelsStack.push({
                  path: append(s.path, selectedItem.name, true).href,
                  cursorPos: { selected: 0, topmost: 0 },
                  items: [],
                  view: panel.view,
                });
              }
            }
          }
        }
      });
    },
    popDir(state, { payload: id }: PayloadAction<string>) {
      if (!state.layout) return;
      const panelsStack = state.states[id];
      if (panelsStack) {
        if (panelsStack.length > 1) {
          panelsStack.pop();
        } else {
          const s = panelsStack[panelsStack.length - 1];
          s.path = truncateLastDir(s.path).href;
          s.cursorPos.selected = 0;
        }
      }
    },
  },
});

export const panelsSlice = panelsSliceUT as Slice<SliceState>;

export const { setPanelsLayout, setActivePanel, setPanelState, setPanelItems, setPanelCursorPos, focusNextPanel, focusPrevPanel, changeDir, popDir } =
  panelsSliceUT.actions;
