import { ReduxFilePanel } from "@components/hocs/ReduxFilePanel";
import { QuickView } from "@components/panels/QuickView/QuickView";
import { useIsInCommandContext } from "@hooks/useCommandContext";
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
  const isInCommandContext = useIsInCommandContext();
  if (layout.when && !isInCommandContext(layout.when)) {
    return <div>123</div>;
  }
  switch (layout.type) {
    case "row":
      return (
        <Row dir={direction}>
          {layout.children.map((l) => (
            <FlexPanel key={l.id} style={{ flexGrow: l.flex ?? 1 }}>
              <LayoutContainer layout={l} direction={direction === "h" ? "v" : "h"} />
            </FlexPanel>
          ))}
        </Row>
      );
    case "file-panel":
      return <ReduxFilePanel layout={layout} />;
    case "quick-view":
      return <QuickView layout={layout} />;
    default:
      return null;
  }
}
