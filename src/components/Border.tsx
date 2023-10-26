import { css } from "@features/styles";
import { PropsWithChildren } from "react";

export const Border = ({ color, children }: PropsWithChildren<{ color: string }>) => {
  return (
    <div className={css("Border")} style={{ border: `1px solid var(--${color})` }}>
      {children}
    </div>
  );
};
