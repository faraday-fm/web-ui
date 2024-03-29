import { ImmerStateCreator } from "../../utils/immer";
import equal from "fast-deep-equal";
import { ContextVariables } from "./types";

interface State {
  variables: ContextVariables;
}

interface Actions {
  setVariables(id: string, variables?: Record<string, unknown>): void;
  updateVariables(id: string, variables?: Record<string, unknown>): void;
}

export type ContextVariablesSlice = State & Actions;

export const createContextVariablesSlice: ImmerStateCreator<ContextVariablesSlice> = (set) => ({
  variables: {},
  setVariables: (id: string, variables?: Record<string, unknown>) =>
    set((s) => {
      if (variables) {
        if (!equal(s.variables[id], variables)) {
          s.variables[id] = variables;
        }
      } else {
        delete s.variables[id];
      }
    }),
  updateVariables: (id: string, variables?: Record<string, unknown>) =>
    set((s) => {
      if (variables) {
        if (!equal(s.variables[id], variables)) {
          s.variables[id] = { ...s.variables[id], ...variables };
        }
      }
    }),
});
