import { QuickNavigationProvider } from "@contexts/quickNavigationContext";
import styled from "styled-components";

import { TopMenuItem } from "./TopMenuItem";

const Root = styled.div.withConfig({ displayName: "Root" })`
  display: flex;
  background-color: var(--color-03);
  color: var(--color-00);
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
`;

export function TopMenu() {
  return (
    <QuickNavigationProvider>
      <Root>
        <TopMenuItem header="Left" />
        <TopMenuItem header="Files" />
        <TopMenuItem header="Commands" />
        <TopMenuItem header="Options" />
        <TopMenuItem header="Right" />
        <TopMenuItem header="File" />
      </Root>
    </QuickNavigationProvider>
  );
}
