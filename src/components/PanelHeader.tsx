import { css } from "@features/styles";
import { PropsWithChildren } from "react";

export const PanelHeader = ({ active, children }: PropsWithChildren<{ active: boolean }>) => {
  return <div className={css("PanelHeader", active ? "-active" : "")}>{children}</div>;
};
