import { Extension } from "@features/extensions/extension";
import { useFs } from "@hooks/useFs";
import { filename } from "@utils/path";
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
  const frames = useRef<Record<string, { frame: ReactElement; ref: QuickViewFrameActions | null }>>({});
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

  useEffect(() => {
    if (content && quickViewScript) {
      frames.current[quickViewScript.id].ref?.setContent({ content, path });
    }
  }, [content, path, quickViewScript]);

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
          frames.current[quickViewScript.id].ref = r;
        }}
        script={quickViewScript.script}
      />
    );
    frames.current[quickViewScript.id] = { frame: f, ref: null };
    setFrame(f);
  }, [quickViewScript]);

  return <Root>{frame}</Root>;
}
