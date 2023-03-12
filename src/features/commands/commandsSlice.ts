import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ContextVariables = Record<string, Record<string, unknown>>;

type SliceState = {
  variables: ContextVariables;
};

/** @internal */
export const commandsSlice = createSlice({
  name: "commands",
  initialState: {
    variables: {},
  } as SliceState,
  reducers: {
    setVariables(state, { payload: { id, variables } }: PayloadAction<{ id: string; variables?: Record<string, unknown> }>) {
      if (variables) {
        if (JSON.stringify(state.variables[id]) !== JSON.stringify(variables)) {
          state.variables[id] = variables;
        }
      } else if (state.variables[id] !== undefined) {
        delete state.variables[id];
      }
    },
  },
});

export const { setVariables } = commandsSlice.actions;
