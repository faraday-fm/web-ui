import { PropsWithChildren } from "react";
import { css } from "../features/styles";

export const Border = ({ color, children }: PropsWithChildren<{ color: string }>) => {
  return (
    <div className={css("Border")} style={{ border: `1px solid var(--${color})` }}>
      {children}
    </div>
  );
};
