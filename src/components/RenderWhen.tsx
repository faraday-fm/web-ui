import type { PropsWithChildren } from "react";
import { useIsInContextQuery } from "../features/commands";

export function RenderWhen({ expression, children }: PropsWithChildren<{ expression: string }>) {
  const shouldRender = useIsInContextQuery(expression);
  if (shouldRender) {
    return <>{children}</>;
  }
  return null;
}
