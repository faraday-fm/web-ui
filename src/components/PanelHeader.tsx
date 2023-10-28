import { PropsWithChildren } from "react";
import { css } from "../features/styles";

export const PanelHeader = ({ active, children }: PropsWithChildren<{ active: boolean }>) => {
  return <div className={css("PanelHeader", active ? "-active" : "")}>{children}</div>;
};
