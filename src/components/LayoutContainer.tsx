import { useCallback, useRef } from "react";
import { useInert } from "../features/inert/hooks";
import { usePanels } from "../features/panels";
import { css } from "../features/styles";
import type { PanelsLayout, RowLayout } from "../types";
import { ReduxFilePanel } from "./ReduxFilePanel";
import { RenderWhen } from "./RenderWhen";
import { QuickViewPanel } from "./panels/QuickView";

interface LayoutContainerProps {
  layout: PanelsLayout;
  direction: "h" | "v";
}

function Separator({
  rowId,
  direction,
  items,
  before,
  after,
}: {
  rowId: string;
  direction: "h" | "v";
  items: Record<string, HTMLDivElement | null>;
  before: string;
  after: string;
}) {
  const { resizeChildren } = usePanels();
  const { setInert } = useInert();

  const beforeItem = items[before];
  const afterItem = items[after];
  const pointerDownCoords = useRef<{ x: number; y: number } | undefined>();
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const dim = (r?: DOMRect) => (direction === "h" ? r?.width : r?.height);
      const resizeCursor = direction === "h" ? "col-resize" : "row-resize";
      document.body.style.cursor = resizeCursor;
      pointerDownCoords.current = { x: e.clientX, y: e.clientY };
      const bw = dim(beforeItem?.getBoundingClientRect()) ?? 0;
      const aw = dim(afterItem?.getBoundingClientRect()) ?? 0;
      setInert(true);
      const handlePointerMove = (e: PointerEvent) => {
        const sizes = Object.values(items).map((i) => dim(i?.getBoundingClientRect()) ?? 1);
        const offs = direction === "h" ? e.clientX : e.clientY;
        const nbw = offs;
        const naw = bw + aw - offs;
        sizes[0] = nbw;
        sizes[1] = naw;
        resizeChildren(rowId, sizes);
      };
      const handlePointerUp = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        setInert(false);
        document.body.style.removeProperty("cursor");
      };
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp, { once: true });
    },
    [afterItem, beforeItem, direction, items, resizeChildren, rowId, setInert],
  );
  return (
    <div className={css("layout-separator")}>
      <div className={css("layout-separator-thumb")} style={{ cursor: direction === "h" ? "col-resize" : "row-resize" }} onPointerDown={handlePointerDown} />
    </div>
  );
}

function RowContainer({ layout, direction }: LayoutContainerProps & { layout: RowLayout }) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  return (
    <div className={css("layout-row")} style={{ flexDirection: direction === "h" ? "row" : "column" }}>
      {layout.children.map((l, idx) => (
        <RenderWhen key={l.id} expression={l.when ?? "true"}>
          {idx > 0 && <Separator rowId={layout.id} direction={direction} items={itemRefs.current} before={layout.children[idx - 1].id} after={l.id} />}
          <div
            ref={(r) => {
              itemRefs.current[l.id] = r;
            }}
            className={css("flex-panel")}
            style={{ flexGrow: l.flex ?? 1 }}
          >
            <LayoutContainer layout={l} direction={direction === "h" ? "v" : "h"} />
          </div>
        </RenderWhen>
      ))}
    </div>
  );
}

function LayoutContainerChooser({ layout, direction }: LayoutContainerProps) {
  switch (layout.type) {
    case "row":
      return <RowContainer layout={layout} direction={direction} />;
    case "file-panel":
      return <ReduxFilePanel layout={layout} />;
    case "quick-view":
      return <QuickViewPanel layout={layout} />;
    default:
      return null;
  }
}

export function LayoutContainer({ layout, direction }: LayoutContainerProps) {
  return layout.when ? (
    <RenderWhen expression={layout.when}>
      <LayoutContainerChooser layout={layout} direction={direction} />
    </RenderWhen>
  ) : (
    <LayoutContainerChooser layout={layout} direction={direction} />
  );
}
