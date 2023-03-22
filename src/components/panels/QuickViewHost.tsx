import { Extension } from "@features/extensions/extension";
import { quickViewSelector } from "@features/extensions/selectors";
import { useFs } from "@hooks/useFs";
import { useAppSelector } from "@store";
import { filename } from "@utils/path";
import { DeferredPromise, deferredPromise } from "@utils/promise";
import { ReactElement, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { QuickViewFrame, QuickViewFrameActions } from "./QuickViewFrame";

const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  align-items: stretch;
  justify-items: stretch;
`;

type Frame = { element: ReactElement; actions: DeferredPromise<QuickViewFrameActions> };

export default function QuickViewHost({ path, content }: { path: string; content?: Uint8Array }) {
  // const [extensions, setExtensions] = useState<Extension[]>();
  const frames = useRef<Record<string, Frame>>({});
  const [frame, setFrame] = useState<Frame>();
  const quickView = useAppSelector(quickViewSelector);

  useEffect(() => {
    (async () => {
      let frame: Frame | undefined;
      if (quickView?.script) {
        frame = frames.current[quickView.quickView.id];
        if (!frame) {
          const qw = (
            <QuickViewFrame
              key={quickView.quickView.id}
              ref={(r) => {
                if (r) {
                  frames.current[quickView.quickView.id].actions.resolve(r);
                }
              }}
              script={quickView.script}
            />
          );
          frame = { element: qw, actions: deferredPromise() };
          frames.current[quickView.quickView.id] = frame;
          setFrame(frame);
        }
      }
      setFrame(frame);
      frame?.actions.promise.then((a) => a.setContent({ content, path }));
      Object.values(frames.current).forEach((f) => f.actions.promise.then((a) => a.setVisibility(f.element === frame?.element)));
    })();
  }, [quickView, content, path]);

  return <Root>{Object.values(frames.current).map((f) => f.element)}</Root>;
}
