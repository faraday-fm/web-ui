import styled, { css } from "styled-components";
import { FarMoreLayout, Layout } from "~/src/types";
import { ReduxFilePanel } from "~/src/components/hocs/ReduxFilePanel";

type LayoutContainerProps = {
  layout: Layout;
  direction: "h" | "v";
};

const LayoutRow = styled.div<{ direction: "h" | "v" }>`
  display: grid;
  grid-auto-flow: ${(p) => (p.direction === "h" ? "column" : "row")};
`;

export function LayoutContainer({ layout, direction }: LayoutContainerProps) {
  switch (layout.type) {
    case "row":
      return (
        <LayoutRow direction={direction}>
          {layout.children.map((l, i) => (
            <LayoutContainer key={l.id} layout={l} direction={direction === "h" ? "v" : "h"} />
          ))}
        </LayoutRow>
      );
    case "filePanel":
      return <ReduxFilePanel id={layout.id} />;
    default:
      return null;
  }
}
