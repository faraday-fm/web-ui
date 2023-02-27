import { Node, parser } from "@utils/whenClauseParser";
import React, { PropsWithChildren, useContext, useEffect, useId, useState } from "react";

type CommandContext = Record<string, Record<string, unknown>>;

const context = React.createContext<CommandContext>({});

export function CommandContextProvider({ children }: PropsWithChildren) {
  const [ctx] = useState<CommandContext>({});
  return <context.Provider value={ctx}>{children}</context.Provider>;
}

export function useCommandContext(variables: string[], isActive?: boolean): void;
export function useCommandContext(variable: string, isActive?: boolean): void;
export function useCommandContext(variables: Record<string, unknown>, isActive?: boolean): void;
export function useCommandContext(arg: unknown, isActive?: boolean): void {
  const ctx = useContext(context);
  const id = useId();
  useEffect(() => {
    if (!isActive) {
      delete ctx[id];
      return undefined;
    }
    let variables: Record<string, unknown>;
    if (typeof arg === "string") {
      variables = { [arg]: true };
    } else if (Array.isArray(arg)) {
      variables = Object.fromEntries(arg.map((v) => [v, true]));
    } else {
      variables = arg as Record<string, unknown>;
    }
    ctx[id] = variables;
    return () => {
      delete ctx[id];
    };
  }, [id, isActive, arg, ctx]);
}

function getContextValue(ctx: CommandContext, variable: string) {
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

function visitNode(ctx: CommandContext, node: Node, stack: unknown[]) {
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

function evaluate(ctx: CommandContext, node: Node) {
  const stack: [] = [];
  visitNode(ctx, node, stack);
  return !!stack.pop();
}

export function useIsInCommandContext() {
  const ctx = useContext(context);
  return (expression: string) => {
    const ast = parser.parse(expression);
    if (ast.status) {
      return evaluate(ctx, ast.value);
    }
    return false;
  };
}
