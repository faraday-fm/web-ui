import { useEffect, useId } from "react";
import { Node, parser } from "~/src/utils/whenClauseParser";

const context = new Map<string, Map<string, unknown>>();

export function useCommandContext(variables: string[], isActive?: boolean): void;
export function useCommandContext(variable: string, isActive?: boolean): void;
export function useCommandContext(variables: Record<string, unknown>, isActive?: boolean): void;
export function useCommandContext(arg: unknown, isActive?: boolean): void {
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
      let values = context.get(v);
      if (!values) {
        values = new Map();
        context.set(v, values);
      }
      values.set(id, variables[v]);
    });
    return () => {
      Object.keys(variables).forEach((v) => {
        const values = context.get(v);
        if (values) {
          values.delete(id);
          if (values.size === 0) {
            context.delete(v);
          }
        }
      });
    };
  }, [id, isActive, arg]);
}

function getContextValue(variable: string) {
  const values = context.get(variable);
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

function visitNode(node: Node, stack: any[]) {
  switch (node._) {
    case "c":
      stack.push(node.val);
      break;
    case "v":
      stack.push(getContextValue(node.val));
      break;
    case "!":
      visitNode(node.node, stack);
      stack.push(!stack.pop());
      break;
    case "==":
    case "!=":
    case "&&":
    case "||":
      {
        visitNode(node.left, stack);
        visitNode(node.right, stack);
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

function evaluate(node: Node) {
  const stack: any[] = [];
  visitNode(node, stack);
  return !!stack.pop();
}

export function isInContext(expression: string) {
  const ast = parser.parse(expression);
  if (ast.status) {
    return evaluate(ast.value);
  }
  return false;
}
