import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { combinePath, isAbsolutePath } from "~/src/utils/pathUtils";

import { FsEntry } from "../../hooks/useFs";

export type Panel = {
  path: string;
  items: FsEntry[];
};

type SliceState = {
  active: string;
  states: Record<string, Panel>;
};

export const panelsSlice = createSlice({
  name: "panels",
  initialState: {
    active: "left",
    states: {
      left: {
        items: [],
        path: "/",
      },
      right: {
        items: [],
        path: "/Users",
      },
    },
  } as SliceState,
  reducers: {
    setActivePanel: (state, action: PayloadAction<string>) => {
      state.active = action.payload;
    },
    setPanelData: (state, action: PayloadAction<{ id: string; path: string; items: FsEntry[] }>) => {
      state.states[action.payload.id].path = action.payload.path;
      state.states[action.payload.id].items = action.payload.items;
    },
    changeDir: (state, action: PayloadAction<string>) => {
      if (isAbsolutePath(action.payload)) {
        state.states[state.active].path = action.payload;
      } else {
        state.states[state.active].path = combinePath(state.states[state.active].path, action.payload);
      }
    },
  },
});

export const { setActivePanel, setPanelData, changeDir } = panelsSlice.actions;

export default panelsSlice.reducer;
