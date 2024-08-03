import type { ReactNode } from "react";

interface HotKeyProps {
  children: (hotKey: string) => ReactNode;
}

export function HotKey({ children }: HotKeyProps) {
  return <>{children("1")}</>;
}
