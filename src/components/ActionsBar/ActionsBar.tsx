import styled from "styled-components";
import { ActionButton } from "../ActionButton/ActionButton";

const Root = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  overflow: hidden;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
`;

export function ActionsBar() {
  return (
    <Root tabIndex={-1}>
      <ActionButton fnKey="1" header="Помощь" />
      <ActionButton fnKey="2" header="ПользМ" />
      <ActionButton fnKey="3" header="Просм" />
      <ActionButton fnKey="4" header="Редакт" />
      <ActionButton fnKey="5" header="Копир" />
      <ActionButton fnKey="6" header="Перен" />
      <ActionButton fnKey="7" header="Папка" />
      <ActionButton fnKey="8" header="Удален" />
      <ActionButton fnKey="9" header="КонфМн" />
      <ActionButton fnKey="10" header="Выход" />
      <ActionButton fnKey="11" header="Плагины" />
      <ActionButton fnKey="12" header="Экраны" />
    </Root>
  );
}
