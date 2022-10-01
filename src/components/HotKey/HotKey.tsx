import { ReactNode } from "react";

type HotKeyProps = {
  children: (hotKey: string) => ReactNode;
};

export function HotKey({ children }: HotKeyProps) {
  return <>{children("1")}</>;
}
