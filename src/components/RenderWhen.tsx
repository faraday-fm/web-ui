import { PropsWithChildren } from "react";
import { useIsInCommandContextQuery } from "../features/commands";

export function RenderWhen({ expression, children }: PropsWithChildren<{ expression: string }>) {
  const shouldRender = useIsInCommandContextQuery(expression);
  if (shouldRender) {
    return children;
  }
  return null;
}
