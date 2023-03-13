import { AutoHotKeyLabel } from "@components/AutoHotKeyLabel";
import styled from "styled-components";

type TopMenuItemProps = {
  header: string;
};

const Item = styled.div`
  position: relative;
  padding: 0 1em;
`;

const Label = styled.div`
  position: absolute;
  top: 100%;
  background-color: red;
`;

export function TopMenuItem({ header }: TopMenuItemProps) {
  return (
    <Item>
      <AutoHotKeyLabel text={header} />
      {/* <HotKey>{(k) => <Highlight text={header} highlight={k} />}</HotKey> */}
      <Label>
        <AutoHotKeyLabel text="12345" />
      </Label>
    </Item>
  );
}
