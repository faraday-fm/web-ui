import quickViewHtml from "@assets/quick-view.html";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { deferredPromise } from "@utils/promise";
import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface QuickViewFrameActions {
  setContent({ content, path }: { content?: Uint8Array; path: string }): Promise<void>;
  setVisibility(show: boolean): Promise<void>;
}

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

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.source === iframeRef.current?.contentWindow) {
        if (e.data === "focus") {
          iframeRef.current.focus();
        }
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

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
        const iframeWindow = iframe.contentWindow!;
        iframeWindow.postMessage({ type: "init", js: initialScript }, "*");
        loadedPromise.current.resolve(iframeWindow);
      };
    }
  }, [initialScript]);

  useEffect(() => {
    void (async () => {
      const iframeWindow = await loadedPromise.current.promise;
      iframeWindow.postMessage({ type: "theme", theme }, "*");
      themeSetPromise.current.resolve(iframeWindow);
    })();
  }, [theme]);

  return <WebView ref={iframeRef} tabIndex={0} title="" src={`data:text/html;base64,${quickViewHtmlBase64}`} />;
});
