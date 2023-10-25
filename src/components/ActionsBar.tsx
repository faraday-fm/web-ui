import styled from "@emotion/styled";
import { memo } from "react";
import { ActionButton } from "./ActionButton";

const Root = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  overflow: hidden;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
`;

export const ActionsBar = memo(function ActionsBar() {
  return (
    <Root tabIndex={-1}>
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
    </Root>
  );
});
