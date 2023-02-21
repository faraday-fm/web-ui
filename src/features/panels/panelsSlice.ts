import { createAsyncThunk, createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@store";
import { FsEntry, PanelsLayout } from "@types";
import { traverseLayout } from "@utils/layout";

export type Panel = {
  items: FsEntry[];
};

type SliceState = {
  active: string;
  layout?: PanelsLayout;
  states: Record<string, Panel | undefined>;
};

export const listDir = createAsyncThunk<
  FsEntry[],
  { dir: string },
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>("panels/listDir", async ({ dir }, thunkAPI) => {
  const state = thunkAPI.getState();
  const response = await state.host.fs.listDir(dir);
  return response;
});

export const panelsSlice: Slice<SliceState> = createSlice({
  name: "panels",
  initialState: {
    states: {},
  } as SliceState,
  reducers: {
    setPanelsLayout(state, { payload }: PayloadAction<PanelsLayout>) {
      state.layout = payload;
    },
    setActivePanel(state, { payload }: PayloadAction<string>) {
      state.active = payload;
    },
    setPanelData(state, { payload }: PayloadAction<{ id: string; items: FsEntry[] }>) {
      state.states[payload.id] = payload;
    },
    focusNextPanel(state, { payload: { backward = false } }: PayloadAction<{ backward: boolean }>) {
      if (state.layout) {
        let lastPanelId: string | undefined;
        let newActivePanelSet = false;
        traverseLayout(
          state.layout,
          (panel) => {
            if (lastPanelId && !newActivePanelSet && panel.id === state.active) {
              state.active = lastPanelId;
              newActivePanelSet = true;
            }
            lastPanelId = panel.id;
          },
          !backward
        );
        if (!newActivePanelSet && lastPanelId) {
          state.active = lastPanelId;
        }
      }
      // if (state.layout) {
      //   let firstPanelId: string | undefined;
      //   let activePanelFound = false;
      //   let newActivePanelSet = false;
      //   traverseLayout(state.layout, (panel) => {
      //     if (!firstPanelId) {
      //       firstPanelId = panel.id;
      //     }
      //     if (activePanelFound && !newActivePanelSet) {
      //       state.active = panel.id;
      //       newActivePanelSet = true;
      //     }
      //     if (!activePanelFound && panel.id === state.active) {
      //       activePanelFound = true;
      //     }
      //   });
      //   if (activePanelFound && !newActivePanelSet && firstPanelId) {
      //     state.active = firstPanelId;
      //   }
      // }
    },
    focusPrevPanel(state) {
      if (state.layout) {
        let lastPanelId: string | undefined;
        let newActivePanelSet = false;
        traverseLayout(state.layout, (panel) => {
          if (lastPanelId && !newActivePanelSet && panel.id === state.active) {
            state.active = lastPanelId;
            newActivePanelSet = true;
          }
          lastPanelId = panel.id;
        });
        if (!newActivePanelSet && lastPanelId) {
          state.active = lastPanelId;
        }
      }
    },
    // changeDir(state, { payload }: PayloadAction<string>) {
    //   const panel = state.states[state.active];
    //   if (!panel) return;
    //   if (isAbsolutePath(payload)) {
    //     panel.path = payload;
    //   } else {
    //     panel.path = combinePath(panel.path, payload);
    //   }
    // },
  },
});

export const { setPanelsLayout, setActivePanel, setPanelData, focusNextPanel, focusPrevPanel } = panelsSlice.actions;
