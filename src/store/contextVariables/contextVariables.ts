import { state } from "effie";
import equal from "fast-deep-equal";
import { produce } from "immer";
import { useCallback, useRef, useState } from "react";

type ContextVariables = Record<string, Record<string, unknown>>;

export function ContextVariables() {
  const [variables, setVariables] = useState<ContextVariables>({});
  const variablesRef = useRef<ContextVariables>({});

  return state({
    variables,
    setVariables: useCallback((id: string, vars?: Record<string, unknown>) => {
      if (vars) {
        if (!equal(variablesRef.current[id], vars)) {
          setVariables(
            (variablesRef.current = produce(variablesRef.current, (v) => {
              v[id] = vars;
            }))
          );
        }
      } else {
        if (typeof variablesRef.current[id] !== "undefined") {
          // console.error("***", variablesRef.current[id], vars);
          setVariables(
            (variablesRef.current = produce(variablesRef.current, (v) => {
              delete v[id];
            }))
          );
        }
      }
    }, []),
    updateVariables: useCallback((id: string, vars?: Record<string, unknown>) => {
      if (vars) {
        if (!equal(variablesRef.current[id], vars)) {
          setVariables(
            (variablesRef.current = produce(variablesRef.current, (v) => {
              v[id] = { ...v[id], ...vars };
            }))
          );
        }
      }
    }, []),
  });
}
