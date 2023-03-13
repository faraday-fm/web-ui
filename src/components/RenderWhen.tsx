import { useIsInCommandContextQuery } from "@hooks/useCommandContext";
import { PropsWithChildren } from "react";

export function RenderWhen({ expression, children }: PropsWithChildren<{ expression: string }>) {
  const shouldRender = useIsInCommandContextQuery(expression);
  if (shouldRender) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }
  return null;
}
