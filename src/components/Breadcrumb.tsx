import { PropsWithChildren } from "react";

import { BreadcrumbItem } from "./BreadcrumbItem";
import { css } from "../features/styles";

function BreadcrumbRoot({ isActive, children }: PropsWithChildren & { isActive: boolean }) {
  return <nav className={css("breadcrumb", isActive ? "-active" : "")}>{children}</nav>;
}

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem,
});
