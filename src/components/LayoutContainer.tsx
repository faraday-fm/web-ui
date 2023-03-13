import { QuickView } from "@components/panels/QuickView";
import { ReduxFilePanel } from "@components/ReduxFilePanel";
import { RenderWhen } from "@components/RenderWhen";
import { PanelsLayout } from "@types";
import styled from "styled-components";

type LayoutContainerProps = {
  layout: PanelsLayout;
  direction: "h" | "v";
};

const Row = styled.div<{ dir: "h" | "v" }>`
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
        <RenderWhen expression={layout.when ?? "true"}>
          <Row dir={direction}>
            {layout.children.map((l) => (
              <RenderWhen key={l.id} expression={l.when ?? "true"}>
                <FlexPanel style={{ flexGrow: l.flex ?? 1 }}>
                  <LayoutContainer layout={l} direction={direction === "h" ? "v" : "h"} />
                </FlexPanel>
              </RenderWhen>
            ))}
          </Row>
        </RenderWhen>
      );
    case "file-panel":
      return (
        <RenderWhen expression={layout.when ?? "true"}>
          <ReduxFilePanel layout={layout} />
        </RenderWhen>
      );
    case "quick-view":
      return (
        <RenderWhen expression={layout.when ?? "true"}>
          <QuickView layout={layout} />
        </RenderWhen>
      );
    default:
      return null;
  }
}
