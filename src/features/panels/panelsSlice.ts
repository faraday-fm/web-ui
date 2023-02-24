import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { FilePanelView, FsEntry, PanelsLayout } from "@types";
import { traverseLayout } from "@utils/layout";

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
  states: Record<string, PanelState | undefined>;
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
      state.states[payload.id] = payload.state;
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
        if (panel.id === state.activePanelId) {
          const panelState = state.states[panel.id];
          if (panelState) {
            const selectedItemPos = panelState.cursorPos.selected;
            const selectedItem = panelState.items[selectedItemPos];
            if (selectedItem.isDir) {
              if (selectedItem.name === "..") {
                const lastSlash = panel.path.lastIndexOf("/");
                panel.path = panel.path.substring(0, lastSlash) || "/";
              } else if (panel.path.endsWith("/")) {
                panel.path = `${panel.path}${selectedItem.name}`;
              } else {
                panel.path = `${panel.path}/${selectedItem.name}`;
              }
            }
          }
        }
      });
    },
  },
});

export const panelsSlice = panelsSliceUT as Slice<SliceState>;

export const { setPanelsLayout, setActivePanel, setPanelState, focusNextPanel, focusPrevPanel, changeDir } = panelsSliceUT.actions;
