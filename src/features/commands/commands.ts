import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type ContextVariables = Record<string, Record<string, unknown>>;

interface State {
  variables: ContextVariables;
}

interface Actions {
  setVariables(id: string, variables?: Record<string, unknown>): void;
}

/** @internal */
export const useCommands = create(
  immer<State & Actions>((set) => ({
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
  }))
);
