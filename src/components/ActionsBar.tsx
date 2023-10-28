import { memo } from "react";
import { css } from "../features/styles";
import { ActionButton } from "./ActionButton";

export const ActionsBar = memo(function ActionsBar() {
  return (
    <div className={css("ActionsBar")} tabIndex={-1}>
      <ActionButton fnKey="1" header="Help" />
      <ActionButton fnKey="2" header="Menu" />
      <ActionButton fnKey="3" header="View" />
      <ActionButton fnKey="4" header="Edit" />
      <ActionButton fnKey="5" header="Copy" />
      <ActionButton fnKey="6" header="RenMov" />
      <ActionButton fnKey="7" header="Mkdir" />
      <ActionButton fnKey="8" header="Delete" />
      <ActionButton fnKey="9" header="PullDn" />
      <ActionButton fnKey="10" header="Quit" />
      <ActionButton fnKey="11" header="Plugins" />
      <ActionButton fnKey="12" header="Screens" />
    </div>
  );
});
