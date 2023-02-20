import { PropsWithChildren } from "react";
import styled from "styled-components";
import { Color } from "@styled";
import { BreadcrumbItem } from "./BreadcrumbItem";

const NavWithBackgroundProp = styled.nav<{ backgroundColor: Color }>`
  --background: linear-gradient(to right, transparent, ${(p) => p.backgroundColor});
  background-color: ${(p) => p.backgroundColor};
  display: flex;
  flex-direction: row;
  overflow: hidden;

  &:hover > :not(:hover):last-child {
    /* flex-shrink: 1; */
  }
`;

function BreadcrumbRoot({ children, backgroundColor }: PropsWithChildren & { backgroundColor: Color }) {
  return <NavWithBackgroundProp backgroundColor={backgroundColor}>{children}</NavWithBackgroundProp>;
}

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem,
});
