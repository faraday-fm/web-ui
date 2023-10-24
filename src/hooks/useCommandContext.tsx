import { ContextVariables } from "@features/contextVariables/contextVariables";
import { useContextVariables } from "@features/contextVariables/hooks";
import { Node, parser } from "@utils/whenClauseParser";
import equal from "fast-deep-equal";
import { useCallback, useEffect, useId, useMemo, useRef } from "react";

type Variables = string | string[] | Record<string, unknown>;

export function useCommandContext(variables: Variables, isActive?: boolean): void {
  const id = useId();
  const { setVariables } = useContextVariables();
  const prevVariables = useRef<Variables>();
  useEffect(() => {
    if (isActive === false) {
      return;
    }
    let vars: Record<string, unknown>;
    if (!equal(prevVariables.current, variables)) {
      if (typeof variables === "string") {
        vars = { [variables]: true };
      } else if (Array.isArray(variables)) {
        vars = Object.fromEntries(variables.map((v) => [v, true]));
      } else {
        vars = variables;
      }
      setVariables(id, vars);
    }

    return () => {
      setVariables(id, undefined);
    };
  }, [id, isActive, setVariables, variables]);
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
