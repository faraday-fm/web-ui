import { type ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import quickViewHtml from "../../assets/quick-view.html";
import { css } from "../../features/styles";
import { useTheme } from "../../features/themes";

export interface QuickViewFrameActions {
  setContent({ content, path }: { content?: Uint8Array; path?: string }): Promise<void>;
  setVisibility(show: boolean): Promise<void>;
}

const quickViewHtmlBase64 = btoa(quickViewHtml);

export const QuickViewFrame = forwardRef(function QuickViewFrame({ script }: { script: string }, ref: ForwardedRef<QuickViewFrameActions>) {
  const [initialScript] = useState(script);
  const loadedPromise = useRef(Promise.withResolvers<Window>());
  const themeSetPromise = useRef(Promise.withResolvers<Window>());
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
          iframeWindow.postMessage({ type: "content", content, path }, "*", content?.buffer ? [content.buffer] : undefined);
        }
      },
      async setVisibility(show) {
        if (iframeRef.current) {
          if (show) {
            iframeRef.current.style.removeProperty("display");
          } else if (iframeRef.current.style.display !== "none") {
            iframeRef.current.style.display = "none";
            const iframeWindow = await themeSetPromise.current.promise;
            iframeWindow.postMessage({ type: "content" }, "*");
          }
        }
      },
    }),
    [],
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
    (async () => {
      const iframeWindow = await loadedPromise.current.promise;
      iframeWindow.postMessage({ type: "theme", theme }, "*");
      themeSetPromise.current.resolve(iframeWindow);
    })();
  }, [theme]);

  return (
    <iframe
      className={css("quick-view-web-view")}
      ref={iframeRef}
      sandbox="allow-scripts"
      tabIndex={0}
      title="quick view"
      src={`data:text/html;base64,${quickViewHtmlBase64}`}
    />
  );
});
