import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FsEntry, Layout } from "~/src/types";
import { combinePath, isAbsolutePath } from "~/src/utils/pathUtils";

export type Panel = {
  path: string;
  items: FsEntry[];
};

type SliceState = {
  active: string;
  layout?: Layout;
  states: Record<string, Panel | undefined>;
};

export const panelsSlice = createSlice({
  name: "panels",
  initialState: {
    states: {},
  } as SliceState,
  reducers: {
    setActivePanel(state, { payload }: PayloadAction<string>) {
      state.active = payload;
    },
    setPanelData(state, { payload }: PayloadAction<{ id: string; path: string; items: FsEntry[] }>) {
      state.states[payload.id] = payload;
    },
    changeDir(state, { payload }: PayloadAction<string>) {
      const panel = state.states[state.active];
      if (!panel) return;
      if (isAbsolutePath(payload)) {
        panel.path = payload;
      } else {
        panel.path = combinePath(panel.path, payload);
      }
    },
  },
});

export const { setActivePanel, setPanelData, changeDir } = panelsSlice.actions;
