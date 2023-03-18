import { Extension } from "@features/extensions/extension";
import { useFs } from "@hooks/useFs";
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
  const [extensions, setExtensions] = useState<Extension[]>();
  const frames = useRef<Record<string, Frame>>({});
  const [frame, setFrame] = useState<Frame>();
  const fs = useFs();

  useEffect(() => {
    (async () => {
      const ext1 = new Extension("faraday:/extensions/faraday.image-viewer", fs);
      await ext1.load();
      const ext2 = new Extension("faraday:/extensions/faraday.text-viewer", fs);
      await ext2.load();
      const ext3 = new Extension("faraday:/extensions/faraday.markdown-viewer", fs);
      await ext3.load();
      setExtensions([ext1, ext2, ext3]);
    })();
  }, [fs]);

  useEffect(() => {
    (async () => {
      if (!extensions) {
        return;
      }
      let frame: Frame | undefined;
      for (const ext of extensions) {
        // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-non-null-assertion
        const script = await ext.getQuickViewScript({ filename: filename(path)! });
        if (script) {
          frame = frames.current[ext.id];
          if (!frame) {
            const qw = (
              <QuickViewFrame
                key={ext.id}
                ref={(r) => {
                  if (r) {
                    frames.current[ext.id].actions.resolve(r);
                  }
                }}
                script={script}
              />
            );
            frame = { element: qw, actions: deferredPromise() };
            frames.current[ext.id] = frame;
            setFrame(frame);
          }
          break;
        }
      }
      setFrame(frame);
      frame?.actions.promise.then((a) => a.setContent({ content, path }));
      Object.values(frames.current).forEach((f) => f.actions.promise.then((a) => a.setVisibility(f.element === frame?.element)));
    })();
  }, [extensions, content, path]);

  return <Root>{Object.values(frames.current).map((f) => f.element)}</Root>;
}
