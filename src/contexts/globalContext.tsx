import { useCommandContext } from "@hooks/useCommandContext";
import { useAppSelector } from "@store";
import { PropsWithChildren } from "react";

export function GlobalContextProvider({ children }: PropsWithChildren) {
  const context = useAppSelector((state) => state.globalContext);
  useCommandContext(context);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
