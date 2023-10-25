import styled from "styled-components";

export const PanelHeader = styled.div.withConfig({ displayName: "PanelHeader" })<{ $active: boolean }>`
  color: ${(p) => p.theme.colors[p.$active ? "panel.header.foreground:focus" : "panel.header.foreground"]};
  background-color: ${(p) => p.theme.colors[p.$active ? "panel.header.background:focus" : "panel.header.background"]};
  overflow: hidden;
`;
