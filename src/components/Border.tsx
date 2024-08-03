import type { PropsWithChildren } from "react";
import { css } from "../features/styles";

export const Border = ({ color, children, double }: PropsWithChildren<{ color: string; double?: boolean }>) => {
  return (
    <div className={css("border", double ? "-double" : "")} style={{ borderColor: `var(--${color})` }}>
      {children}
    </div>
  );
};
