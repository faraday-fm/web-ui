import equal from "fast-deep-equal";
import { produce } from "immer";
import { atom, useAtom } from "jotai";
import { useCallback, useMemo } from "react";
import type { ContextVariables } from "./types";

export const contextVariablesAtom = atom<ContextVariables>({});

export function useContextVariables() {
  const [contextVariables, setContextVariables] = useAtom(contextVariablesAtom);

  const setVariables = useCallback(
    (id: string, variables?: Record<string, unknown>) =>
      setContextVariables(
        produce((s) => {
          if (variables) {
            if (!equal(s[id], variables)) {
              s[id] = variables;
            }
          } else {
            delete s[id];
          }
        }),
      ),
    [setContextVariables],
  );

  const updateVariables = useCallback(
    (id: string, variables?: Record<string, unknown>) =>
      setContextVariables(
        produce((s) => {
          if (variables) {
            if (!equal(s[id], variables)) {
              s[id] = { ...s[id], ...variables };
            }
          }
        }),
      ),
    [setContextVariables],
  );

  return useMemo(
    () => ({
      variables: contextVariables,
      setVariables,
      updateVariables,
    }),
    [contextVariables, setVariables, updateVariables],
  );
}
