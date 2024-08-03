import type { PropsWithChildren } from "react";

import { css } from "../features/styles";
import { BreadcrumbItem } from "./BreadcrumbItem";

function BreadcrumbRoot({ isActive, children }: PropsWithChildren & { isActive: boolean }) {
  return <nav className={css("breadcrumb", isActive ? "-active" : "")}>{children}</nav>;
}

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem,
});
