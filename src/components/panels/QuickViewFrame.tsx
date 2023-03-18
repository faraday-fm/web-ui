import quickViewHtml from "@assets/quick-view.html";
import { deferredPromise } from "@utils/promise";
import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import styled from "styled-components";

export type QuickViewFrameActions = {
  setContent({ content, path }: { content: Uint8Array; path: string }): Promise<void>;
};

const WebView = styled.iframe`
  border: none;
  min-width: 0;
`;

const quickViewHtmlBase64 = btoa(quickViewHtml);

export const QuickViewFrame = forwardRef(function QuickViewFrame({ script }: { script: string }, ref: ForwardedRef<QuickViewFrameActions>) {
  const [initialScript] = useState(script);
  const loadedPromise = useRef(deferredPromise());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (script !== initialScript) {
    throw new Error("'script' should not be changed.");
  }

  useImperativeHandle(
    ref,
    () => ({
      async setContent({ content, path }) {
        await loadedPromise.current.promise;
        iframeRef.current?.contentWindow?.postMessage({ type: "content", content, path }, "*");
      },
    }),
    []
  );

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        iframeRef.current?.contentWindow?.postMessage({ type: "init", js: initialScript }, "*");
        loadedPromise.current.resolve(null);
      };
    }
  }, [initialScript]);

  return <WebView ref={iframeRef} title="" src={`data:text/html;base64,${quickViewHtmlBase64}`} />;
});
