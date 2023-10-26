import { css } from "@features/styles";
import { memo } from "react";

interface ActionButtonProps {
  fnKey: string;
  header: string;
}

export const ActionButton = memo(function ActionButton({ fnKey, header }: ActionButtonProps) {
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span className={css("ActionButton")} onMouseDown={(e: React.MouseEvent) => e.preventDefault()}>
      <span className={css("FnKey")}>{fnKey}</span>
      <div className={css("HeaderButton")}>{header}</div>
    </span>
  );
});
