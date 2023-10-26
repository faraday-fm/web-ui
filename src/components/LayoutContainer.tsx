import { ReduxFilePanel } from "@components/ReduxFilePanel";
import { RenderWhen } from "@components/RenderWhen";
import { QuickView } from "@components/panels/QuickView";
import { css } from "@features/styles";
import { PanelsLayout } from "@types";

interface LayoutContainerProps {
  layout: PanelsLayout;
  direction: "h" | "v";
}

export function LayoutContainer({ layout, direction }: LayoutContainerProps) {
  switch (layout.type) {
    case "row":
      return (
        <RenderWhen expression={layout.when ?? "true"}>
          <div className={css("LayoutRow")} style={{ flexDirection: direction === "h" ? "row" : "column" }}>
            {layout.children.map((l) => (
              <RenderWhen key={l.id} expression={l.when ?? "true"}>
                <div className={css("FlexPanel")} style={{ flexGrow: l.flex ?? 1 }}>
                  <LayoutContainer layout={l} direction={direction === "h" ? "v" : "h"} />
                </div>
              </RenderWhen>
            ))}
          </div>
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
