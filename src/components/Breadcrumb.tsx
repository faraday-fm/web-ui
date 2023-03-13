import { PropsWithChildren } from "react";
import styled from "styled-components";

import { BreadcrumbItem } from "./BreadcrumbItem";

const NavWithBackgroundProp = styled.nav<{ $isActive: boolean }>`
  --background: linear-gradient(to right, transparent, ${(p) => (p.$isActive ? p.theme.filePanel.header.activeBg : p.theme.filePanel.header.inactiveBg)});
  display: flex;
  flex-direction: row;
  overflow: hidden;

  &:hover > :not(:hover):last-child {
    /* flex-shrink: 1; */
  }
`;

function BreadcrumbRoot({ isActive, children }: PropsWithChildren & { isActive: boolean }) {
  return <NavWithBackgroundProp $isActive={isActive}>{children}</NavWithBackgroundProp>;
}

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem,
});
