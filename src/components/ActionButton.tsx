import { memo } from "react";
import { css } from "../features/styles";

interface ActionButtonProps {
  fnKey: string;
  header: string;
}

export const ActionButton = memo(function ActionButton({ fnKey, header }: ActionButtonProps) {
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span className={css("action-button")} onMouseDown={(e: React.MouseEvent) => e.preventDefault()}>
      <span className={css("fn-key")}>{fnKey}</span>
      <div className={css("header-button")}>{header}</div>
    </span>
  );
});
