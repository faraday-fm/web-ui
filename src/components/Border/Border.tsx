import styled from "styled-components";
import { Border as BorderProps } from "@themes/types";

export const Border = styled.div<BorderProps>`
  border: ${(p) => p.thickness} solid ${(p) => p.color};
  border-radius: ${(p) => p.radius};
  margin: ${(p) => p.margin};
  padding: ${(p) => p.padding};
  display: grid;
  overflow: hidden;
  ${(p) => p.extension}
`;
