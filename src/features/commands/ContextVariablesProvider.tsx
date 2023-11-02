import { PropsWithChildren, createContext, useContext, useId, useMemo } from "react";
import { useContextVariables } from "../contextVariables";
import { useIsInContextQuery } from "./useCommandContext";

export const ContextVariablesIdContext = createContext<string>("<root>");

export function ContextVariablesProvider({ children }: PropsWithChildren) {
  const id = useId();
  return <ContextVariablesIdContext.Provider value={id}>{children}</ContextVariablesIdContext.Provider>;
}

export function DebugContextVariables() {
  const id = useContext(ContextVariablesIdContext);
  const devMode = useIsInContextQuery("devMode");
  const { variables } = useContextVariables();
  const vars = variables[id];
  const entries = useMemo(
    () =>
      Object.entries(vars ?? {})
        .filter(([, v]) => v != null)
        .toSorted(([k1], [k2]) => k1.localeCompare(k2)),
    [vars]
  );
  return (
    devMode &&
    entries.length > 0 && (
      <div style={{ position: "absolute", fontSize: "xx-small", right: 0, top: 0, color: "black", background: "#fff8" }}>
        <table>
          <tbody>
            {entries.map(([key, val]) => (
              <tr key={key}>
                <td>{key}:</td>
                <td>{JSON.stringify(val)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );
}
