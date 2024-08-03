import { type ReactElement, useEffect, useState } from "react";
import { useQuickView } from "../../features/quickViews";
import { css } from "../../features/styles";
import type { QuickViewDefinition } from "../../schemas/manifest";
import { QuickViewFrame, type QuickViewFrameActions } from "./QuickViewFrame";

interface Frame {
  quickView: QuickViewDefinition;
  element: ReactElement;
  actions: PromiseWithResolvers<QuickViewFrameActions>;
}

export default function QuickViewHost({ path, content }: { path?: string; content?: Uint8Array }) {
  const [frames, setFrames] = useState<Record<string, Frame>>({});
  const quickView = useQuickView(path);
  const key = quickView ? `${quickView.extId}.${quickView.quickView.id}` : undefined;

  const activeFrame = key ? frames[key] : undefined;

  useEffect(() => {
    setFrames((frames) => {
      const newFrames = { ...frames };
      let frame: Frame | undefined;
      if (key && quickView) {
        frame = frames[key];
        if (!frame) {
          const qw = (
            <QuickViewFrame
              key={key}
              ref={(r: QuickViewFrameActions | null) => {
                if (r) {
                  newFrames[key].actions.resolve(r);
                }
              }}
              script={quickView.script}
            />
          );
          frame = {
            quickView: quickView.quickView,
            element: qw,
            actions: Promise.withResolvers(),
          };
          newFrames[key] = frame;
        }
      }
      Object.values(newFrames).forEach((f) => void f.actions.promise.then((a) => a.setVisibility(f.element === frame?.element)));
      return newFrames;
    });
  }, [key, quickView]);

  useEffect(() => {
    void activeFrame?.actions.promise.then((a) => a.setContent({ content, path }));
  }, [content, path, activeFrame]);

  return <div className={css("quick-view-host")}>{Object.values(frames).map((f) => f.element)}</div>;
}
