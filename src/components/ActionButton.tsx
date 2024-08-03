import { memo } from "react";
import { css } from "../features/styles";

interface ActionButtonProps {
  fnKey: string;
  header: string;
}

export const ActionButton = memo(function ActionButton({ fnKey, header }: ActionButtonProps) {
  return (
    <span className={css("action-button")} onMouseDown={(e) => e.preventDefault()}>
      <span className={css("fn-key")}>{fnKey}</span>
      <div className={css("header-button")}>{header}</div>
    </span>
  );
});
