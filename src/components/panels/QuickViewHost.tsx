import styled from "@emotion/styled";
import { useQuickView } from "@features/quickViews";
import { QuickView } from "@schemas/manifest";
import { DeferredPromise, deferredPromise } from "@utils/promise";
import { ReactElement, useEffect, useState } from "react";

import { QuickViewFrame, QuickViewFrameActions } from "./QuickViewFrame";

const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  align-items: stretch;
  justify-items: stretch;
`;

interface Frame {
  quickView: QuickView;
  element: ReactElement;
  actions: DeferredPromise<QuickViewFrameActions>;
}

export default function QuickViewHost({ path, content }: { path: string; content?: Uint8Array }) {
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
              ref={(r) => {
                if (r) {
                  newFrames[key].actions.resolve(r);
                }
              }}
              script={quickView.script}
            />
          );
          frame = { quickView: quickView.quickView, element: qw, actions: deferredPromise() };
          newFrames[key] = frame;
        }
      }
      Object.values(newFrames).forEach((f) => void f.actions.promise.then((a) => a.setVisibility(f.element === frame?.element)));
      return newFrames;
    });
  }, [key, quickView]);

  useEffect(() => {
    // console.info("***", path, content?.length);
    void activeFrame?.actions.promise.then((a) => a.setContent({ content, path }));
  }, [content, path, activeFrame]);

  return <Root>{Object.values(frames).map((f) => f.element)}</Root>;
}
