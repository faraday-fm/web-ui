import { ContextVariables, setVariables } from "@features/commands/commandsSlice";
import { useAppDispatch, useAppSelector } from "@store";
import { Node, parser } from "@utils/whenClauseParser";
import { useCallback, useEffect, useId, useMemo } from "react";

export function useCommandContext(variables: string | string[] | Record<string, unknown>, isActive?: boolean): void {
  const id = useId();
  const dispatch = useAppDispatch();
  const varsStr = JSON.stringify(variables);
  useEffect(() => {
    if (isActive !== false) {
      let vars: Record<string, unknown>;
      const variablesCopy = JSON.parse(varsStr);
      if (typeof variablesCopy === "string") {
        vars = { [variablesCopy]: true };
      } else if (Array.isArray(variablesCopy)) {
        vars = Object.fromEntries(variablesCopy.map((v) => [v, true]));
      } else {
        vars = variablesCopy;
      }
      dispatch(setVariables({ id, variables: vars }));
    } else {
      dispatch(setVariables({ id, variables: undefined }));
    }
    return () => {
      dispatch(setVariables({ id, variables: undefined }));
    };
  }, [dispatch, id, isActive, varsStr]);
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
  const ctx = useAppSelector((state) => state.commands.variables);
  return useCallback(
    (expression: string) => {
      const ast = parser.parse(expression);
      if (ast.status) {
        return evaluate(ctx, ast.value);
      }
      return false;
    },
    [ctx]
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
  const result = useAppSelector((state) => {
    const ctx = state.commands.variables;
    if (ast.status) {
      return evaluate(ctx, ast.value);
    }
    return false;
  });

  return result;
}
