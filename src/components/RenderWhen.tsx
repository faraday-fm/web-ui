import { useIsInCommandContextQuery } from "@hooks/useCommandContext";
import { PropsWithChildren } from "react";

export function RenderWhen({ expression, children }: PropsWithChildren<{ expression: string }>) {
  const shouldRender = useIsInCommandContextQuery(expression);
  if (shouldRender) {
    return children;
  }
  return null;
}
