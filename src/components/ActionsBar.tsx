import { memo } from "react";
import { css } from "../features/styles";
import { ActionButton } from "./ActionButton";
import {
  copy_button_text,
  delete_button_text,
  edit_button_text,
  help_button_text,
  menu_button_text,
  mkdir_button_text,
  plugins_button_text,
  pull_down_button_text,
  quit_button_text,
  rename_button_text,
  screens_button_text,
  view_button_text,
} from "../paraglide/messages";

export const ActionsBar = memo(function ActionsBar() {
  return (
    <div className={css("actions-bar")} tabIndex={-1}>
      <ActionButton fnKey="1" header={help_button_text()} />
      <ActionButton fnKey="2" header={menu_button_text()} />
      <ActionButton fnKey="3" header={view_button_text()} />
      <ActionButton fnKey="4" header={edit_button_text()} />
      <ActionButton fnKey="5" header={copy_button_text()} />
      <ActionButton fnKey="6" header={rename_button_text()} />
      <ActionButton fnKey="7" header={mkdir_button_text()} />
      <ActionButton fnKey="8" header={delete_button_text()} />
      <ActionButton fnKey="9" header={pull_down_button_text()} />
      <ActionButton fnKey="10" header={quit_button_text()} />
      <ActionButton fnKey="11" header={plugins_button_text()} />
      <ActionButton fnKey="12" header={screens_button_text()} />
    </div>
  );
});
