import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useId, useMemo } from "react";
import { usePrevValueIfDeepEqual } from "../../hooks/usePrevValueIfDeepEqual";
import { type Node, parser } from "../../utils/whenClauseParser";
import { type ContextVariables, useContextVariables } from "../contextVariables";

type Variables = string | string[] | Record<string, unknown>;

export function useSetContextVariables(variables: Variables, isActive = true): void {
  const id = useContext(ContextVariablesIdContext);
  const { setVariables, updateVariables } = useContextVariables();
  variables = usePrevValueIfDeepEqual(variables);

  useEffect(() => {
    let vars: Record<string, unknown>;
    if (!isActive) {
      if (typeof variables === "string") {
        vars = { [variables]: undefined };
      } else if (Array.isArray(variables)) {
        vars = variables.reduce(
          (r, v) => {
            r[v] = undefined;
            return r;
          },
          {} as typeof vars,
        );
      } else {
        vars = Object.keys(variables).reduce(
          (r, v) => {
            r[v] = undefined;
            return r;
          },
          {} as typeof vars,
        );
      }
    } else {
      if (typeof variables === "string") {
        vars = { [variables]: true };
      } else if (Array.isArray(variables)) {
        vars = variables.reduce(
          (r, v) => {
            r[v] = true;
            return r;
          },
          {} as typeof vars,
        );
      } else {
        vars = variables;
      }
    }
    updateVariables(id, vars);
  }, [id, isActive, updateVariables, variables]);

  useEffect(() => {
    return () => {
      setVariables(id, undefined);
    };
  }, [id, setVariables]);
}

function getContextValue(ctx: ContextVariables, variable: string) {
  let r: unknown;
  for (const v of Object.values(ctx)) {
    const val = v[variable];
    if (val !== undefined) {
      if (r === undefined) {
        r = val;
      } else if (r !== val) {
        return undefined;
      }
    }
  }
  return r;
}

function visitNode(ctx: ContextVariables, node: Node, stack: unknown[]) {
  switch (node._) {
    case "c":
      stack.push(node.val);
      break;
    case "v":
      stack.push(getContextValue(ctx, node.val));
      break;
    case "!":
      visitNode(ctx, node.node, stack);
      stack.push(!stack.pop());
      break;
    case "==":
    case "!=":
    case "&&":
    case "||":
      {
        visitNode(ctx, node.left, stack);
        visitNode(ctx, node.right, stack);
        const right = stack.pop();
        const left = stack.pop();
        if (node._ === "==") stack.push(left === right);
        else if (node._ === "!=") stack.push(left !== right);
        else if (node._ === "||") stack.push(!!left || !!right);
        else if (node._ === "&&") stack.push(!!left && !!right);
      }
      break;
  }
}

function evaluate(ctx: ContextVariables, node: Node) {
  const stack: [] = [];
  visitNode(ctx, node, stack);
  return !!stack.pop();
}

export function useIsInContext() {
  const { variables } = useContextVariables();
  return useCallback(
    (expression: string) => {
      const ast = parser.parse(expression);
      if (ast.status) {
        return evaluate(variables, ast.value);
      }
      return false;
    },
    [variables],
  );
}

export function useIsInContextQuery(expression: string) {
  const ast = useMemo(() => {
    const result = parser.parse(expression);
    if (!result.status) {
      console.error("Cannot parse expression", expression);
    }
    return result;
  }, [expression]);
  const { variables } = useContextVariables();
  if (ast.status) {
    return evaluate(variables, ast.value);
  }
  return false;
}

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
    [vars],
  );
  return (
    <>
      {devMode && entries.length > 0 && (
        <div
          style={{
            position: "absolute",
            fontSize: "xx-small",
            right: 0,
            top: 0,
            color: "black",
            background: "#fff8",
          }}
        >
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
      )}
    </>
  );
}
