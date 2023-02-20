import styled from "styled-components";
import { PanelsLayout } from "@types";
import { ReduxFilePanel } from "@components/hocs/ReduxFilePanel";

type LayoutContainerProps = {
  layout: PanelsLayout;
  direction: "h" | "v";
};

const LayoutRow = styled.div<{ dir: "h" | "v" }>`
  width: 100%;
  display: flex;
  flex-direction: ${(p) => (p.dir === "h" ? "row" : "column")};
`;

const FlexPanel = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-basis: 1px;
  overflow: hidden;
`;

export function LayoutContainer({ layout, direction }: LayoutContainerProps) {
  switch (layout.type) {
    case "row":
      return (
        <LayoutRow dir={direction}>
          {layout.children.map((l) => (
            <FlexPanel key={l.id} style={{ flexGrow: l.flex ?? 1 }}>
              <LayoutContainer layout={l} direction={direction === "h" ? "v" : "h"} />
            </FlexPanel>
          ))}
        </LayoutRow>
      );
    case "file-panel":
      return <ReduxFilePanel layout={layout} />;
    default:
      return null;
  }
}
