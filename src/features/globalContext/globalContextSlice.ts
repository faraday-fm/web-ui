import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SliceState = {
  ["filePanel.selectedName"]?: string;
  ["filePanel.selectedPath"]?: string;
  ["filePanel.isFileSelected"]?: boolean;
  ["filePanel.isDirectorySelected"]?: boolean;
};

/** @internal */
export const globalContextSlice = createSlice({
  name: "panels",
  initialState: {
    states: {},
  } as SliceState,
  reducers: {
    // setSelectedPath(state, { payload }: PayloadAction<string>) {
    //   state.selectedPath = payload;
    // },
    updateState(state, { payload }: PayloadAction<SliceState>) {
      return { ...state, ...payload };
    },
  },
});

export const { updateState } = globalContextSlice.actions;
