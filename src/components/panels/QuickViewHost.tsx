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

export default function QuickViewHost({ path, content }: { path: string; content?: Uint8Array }) {
  const [extensions, setExtensions] = useState<Extension[]>();
  const [quickViewScript, setQuickViewScript] = useState<{ id: string; script: string }>();
  const frames = useRef<Record<string, { frame: ReactElement; actions: DeferredPromise<QuickViewFrameActions> }>>({});
  const [frame, setFrame] = useState<ReactElement>();
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
      let scriptFound = false;
      for (const ext of extensions) {
        // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-non-null-assertion
        const script = await ext.getQuickViewScript({ filename: filename(path)! });
        if (script) {
          setQuickViewScript({ id: ext.id, script });
          scriptFound = true;
          break;
        }
      }
      if (!scriptFound) {
        setQuickViewScript(undefined);
      }
    })();
  }, [extensions, path]);

  // FIXME: if effect (2) is placed before (1), quick view will stop working

  /* (1) */
  useEffect(() => {
    if (!quickViewScript) {
      setFrame(undefined);
      return;
    }
    const existingFrame = frames.current[quickViewScript.id];
    if (existingFrame) {
      setFrame(existingFrame.frame);
      return;
    }
    const f = (
      <QuickViewFrame
        key={quickViewScript.id}
        ref={(r) => {
          if (r) {
            frames.current[quickViewScript.id].actions.resolve(r);
          }
        }}
        script={quickViewScript.script}
      />
    );
    frames.current[quickViewScript.id] = { frame: f, actions: deferredPromise() };
    setFrame(f);
  }, [quickViewScript]);

  /* (2) */
  useEffect(() => {
    if (content && quickViewScript) {
      frames.current[quickViewScript.id]?.actions.promise.then((a) => a.setContent({ content, path }));
    }
  }, [content, path, quickViewScript]);

  return <Root>{frame}</Root>;
}
