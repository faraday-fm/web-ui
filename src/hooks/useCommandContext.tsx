import React, { PropsWithChildren, useContext, useEffect, useId, useState } from "react";
import { Node, parser } from "@utils/whenClauseParser";

type CommandContext = Map<string, Map<string, unknown>>;

const context = React.createContext<CommandContext>(new Map());

export function CommandContextProvider({ children }: PropsWithChildren) {
  const [ctx] = useState<CommandContext>(new Map());
  return <context.Provider value={ctx}>{children}</context.Provider>;
}

export function useCommandContext(variables: string[], isActive?: boolean): void;
export function useCommandContext(variable: string, isActive?: boolean): void;
export function useCommandContext(variables: Record<string, unknown>, isActive?: boolean): void;
export function useCommandContext(arg: unknown, isActive?: boolean): void {
  const ctx = useContext(context);
  const id = useId();
  useEffect(() => {
    if (!isActive) return undefined;
    let variables: Record<string, unknown>;
    if (typeof arg === "string") {
      variables = { [arg]: true };
    } else if (Array.isArray(arg)) {
      variables = Object.fromEntries(arg.map((v) => [v, true]));
    } else {
      variables = arg as Record<string, unknown>;
    }
    Object.keys(variables).forEach((v) => {
      let values = ctx.get(v);
      if (!values) {
        values = new Map();
        ctx.set(v, values);
      }
      values.set(id, variables[v]);
    });
    return () => {
      Object.keys(variables).forEach((v) => {
        const values = ctx.get(v);
        if (values) {
          values.delete(id);
          if (values.size === 0) {
            ctx.delete(v);
          }
        }
      });
    };
  }, [id, isActive, arg, ctx]);
}

function getContextValue(ctx: CommandContext, variable: string) {
  const values = ctx.get(variable);
  if (!values) {
    return undefined;
  }
  let r;
  // eslint-disable-next-line no-restricted-syntax
  for (const v of values.values()) {
    if (r === undefined) {
      r = v;
    } else if (r !== v) {
      return undefined;
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
