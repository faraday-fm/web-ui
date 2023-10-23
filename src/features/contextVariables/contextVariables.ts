import { ImmerStateCreator } from "@utils/immer";

export type ContextVariables = Record<string, Record<string, unknown>>;

interface State {
  variables: ContextVariables;
}

interface Actions {
  setVariables(id: string, variables?: Record<string, unknown>): void;
}

export type ContextVariablesSlice = State & Actions;

export const createContextVariablesSlice: ImmerStateCreator<ContextVariablesSlice> = (set) => ({
  variables: {},
  setVariables: (id: string, variables?: Record<string, unknown>) =>
    set((s) => {
      if (variables) {
        if (JSON.stringify(s.variables[id]) !== JSON.stringify(variables)) {
          s.variables[id] = variables;
        }
      } else if (s.variables[id] !== undefined) {
        delete s.variables[id];
      }
    }),
});
