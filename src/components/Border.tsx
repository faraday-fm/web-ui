import styled from "styled-components";

export const Border = styled.div.withConfig({ displayName: "Border" })<{ $color: string }>`
  display: grid;
  overflow: hidden;
  border: ${(p) => `1px solid ${p.$color}`};
  margin: 1px;
`;
