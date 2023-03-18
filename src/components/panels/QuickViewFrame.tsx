import quickViewHtml from "@assets/quick-view.html";
import { deferredPromise } from "@utils/promise";
import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";

export type QuickViewFrameActions = {
  setContent({ content, path }: { content?: Uint8Array; path: string }): Promise<void>;
  setVisibility(show: boolean): Promise<void>;
};

const WebView = styled.iframe`
  border: none;
  min-width: 0;
`;

const quickViewHtmlBase64 = btoa(quickViewHtml);

export const QuickViewFrame = forwardRef(function QuickViewFrame({ script }: { script: string }, ref: ForwardedRef<QuickViewFrameActions>) {
  const [initialScript] = useState(script);
  const loadedPromise = useRef(deferredPromise<Window>());
  const themeSetPromise = useRef(deferredPromise<Window>());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const theme = useTheme();

  if (script !== initialScript) {
    throw new Error("'script' should not be changed.");
  }

  useImperativeHandle(
    ref,
    () => ({
      async setContent({ content, path }) {
        if (iframeRef.current) {
          const iframeWindow = await themeSetPromise.current.promise;
          iframeWindow.postMessage({ type: "content", content, path }, "*");
        }
      },
      async setVisibility(show) {
        if (iframeRef.current) {
          if (show) {
            if (iframeRef.current.style.display === "none") {
              iframeRef.current.style.removeProperty("display");
            }
          } else if (iframeRef.current.style.display !== "none") {
            iframeRef.current.style.display = "none";
            const iframeWindow = await themeSetPromise.current.promise;
            iframeWindow.postMessage({ type: "content" }, "*");
          }
        }
      },
    }),
    []
  );

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.onload = () => {
        const iframeWindow = iframe.contentWindow as Window;
        iframeWindow.postMessage({ type: "init", js: initialScript }, "*");
        loadedPromise.current.resolve(iframeWindow);
      };
    }
  }, [initialScript]);

  useEffect(() => {
    (async () => {
      const iframeWindow = await loadedPromise.current.promise;
      iframeWindow.postMessage({ type: "theme", theme }, "*");
      themeSetPromise.current.resolve(iframeWindow);
    })();
  }, [theme]);

  return <WebView ref={iframeRef} title="" src={`data:text/html;base64,${quickViewHtmlBase64}`} />;
});
