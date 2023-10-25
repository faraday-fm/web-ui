import { ContextVariables, useContextVariables } from "@features/contextVariables";
import { usePrevValueIfDeepEqual } from "@hooks/usePrevValueIfDeepEqual";
import { Node, parser } from "@utils/whenClauseParser";
import { useCallback, useEffect, useId, useMemo } from "react";

type Variables = string | string[] | Record<string, unknown>;

export function useCommandContext(variables: Variables, isActive = true): void {
  const id = useId();
  const { setVariables } = useContextVariables();
  variables = usePrevValueIfDeepEqual(variables);

  useEffect(() => {
    if (!isActive) {
      setVariables(id, undefined);
      return;
    }
    let vars: Record<string, unknown>;
    if (typeof variables === "string") {
      vars = { [variables]: true };
    } else if (Array.isArray(variables)) {
      vars = variables.reduce((r, v) => {
        r[v] = true;
        return r;
      }, {} as Record<string, true>);
    } else {
      vars = variables;
    }
    setVariables(id, vars);
  }, [id, isActive, setVariables, variables]);

  useEffect(() => {
    return () => {
      setVariables(id, undefined);
    };
  }, [id, setVariables]);
}

function getContextValue(ctx: ContextVariables, variable: string) {
  let r;
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

export function useIsInCommandContext() {
  const { variables } = useContextVariables();
  return useCallback(
    (expression: string) => {
      const ast = parser.parse(expression);
      if (ast.status) {
        return evaluate(variables, ast.value);
      }
      return false;
    },
    [variables]
  );
}

export function useIsInCommandContextQuery(expression: string) {
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
