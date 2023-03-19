import styled from "styled-components";

export const Border = styled.div`
  display: grid;
  overflow: hidden;
  border: ${(p) => `1px solid ${p.theme.colors["dialog.border"]}`};
  margin: 1px;
`;
