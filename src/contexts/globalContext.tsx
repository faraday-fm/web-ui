import { useCommandContext } from "@hooks/useCommandContext";
import { useAppSelector } from "@store";
import { PropsWithChildren } from "react";

export function GlobalContextProvider({ children }: PropsWithChildren) {
  const context = useAppSelector((state) => state.globalContext);
  useCommandContext(context as Record<string, unknown>);

  return children;
}
