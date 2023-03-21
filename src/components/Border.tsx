import styled from "styled-components";

export const Border = styled.div<{ $color: string }>`
  display: grid;
  overflow: hidden;
  border: ${(p) => `1px solid ${p.$color}`};
  margin: 1px;
`;
