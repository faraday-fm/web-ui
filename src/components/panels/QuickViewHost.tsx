import quickViewHtml from "@assets/quick-view.html";
import { Extension } from "@features/extensions/extension";
import { useFs } from "@hooks/useFs";
import { filename } from "@utils/path";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const imageViewer = `
function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export function init() {
  const root = document.createElement('div');
  root.id = "root";
  root.style.display = "grid";
  root.style.justifyContent = "center";
  document.body.appendChild(root);
}
export function updateContent(content, path) {
  const root = document.getElementById("root");
  const img = document.createElement('img');
  img.style.width = "100%";
  img.style.height = "100%";
  const ext = path.split('.').at(-1);
  let mime = '';
  switch (ext) {
    case 'png': mime = 'image/png'; break;
    case 'jpg': case 'jpeg': mime = 'image/jpeg'; break;
    case 'svg': mime = 'image/svg+xml'; break;
  }
  blobToBase64(new Blob([content.buffer], { type: mime })).then(url => img.src = url);
  img.onload = () => {
    root.innerHTML = "";
    root.appendChild(img);
  }
}
`;

const fileViewer = `
export function init() {
  const root = document.createElement('div');
  root.id = "root";
  // root.style.display = "grid";
  document.body.appendChild(root);
}
export function updateContent(content, path) {
  const root = document.getElementById("root");
  root.innerText = new TextDecoder().decode(content);
}
`;

const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  align-items: stretch;
  justify-items: stretch;
`;

const WebView = styled.iframe`
  border: none;
  min-width: 0;
`;

const quickViewHtmlBase64 = btoa(quickViewHtml);

const p1 = { id: "p1", js: imageViewer };
const p2 = { id: "p2", js: fileViewer };

function resolveProvider({ path }: { path: string }) {
  if (path.endsWith(".svg")) return p1;
  return p2;
}

export default function QuickViewHost({ path, content }: { path: string; content?: Uint8Array }) {
  // const quickViewProviders = useQuickViewProviders();
  // const provider = quickViewProviders.resolveProvider({ path });
  // const providerId = "asd";
  // const provider = resolveProvider({ path });
  const webViewRef = useRef<HTMLIFrameElement>(null);
  const [contentWindow, setContentWindow] = useState<Window>();
  const [extensions, setExtensions] = useState<Extension[]>();
  const [quickViewScript, setQuickViewScript] = useState<string>();
  const fs = useFs();

  useEffect(() => {
    (async () => {
      const ext1 = new Extension("faraday:/extensions/faraday.image-viewer", fs);
      await ext1.load();
      const ext2 = new Extension("faraday:/extensions/faraday.text-viewer", fs);
      await ext2.load();
      setExtensions([ext1, ext2]);
    })();
  }, [fs]);

  useEffect(() => {
    (async () => {
      if (!extensions) {
        return;
      }
      for (const ext of extensions) {
        // eslint-disable-next-line no-await-in-loop
        const script = await ext.getQuickViewScript({ filename: filename(path)! });
        if (script) {
          setQuickViewScript(script);
          break;
        }
      }
    })();
  }, [extensions, path]);

  // useLayoutEffect(() => {
  //   const messageListener = (e: MessageEvent) => {
  //     // if (e.source === contentWindow && e.data === "requestScript") {
  //     // }
  //   };
  //   window.addEventListener("message", messageListener);
  //   return () => window.removeEventListener("message", messageListener);
  // }, [contentWindow]);
  useEffect(() => {
    if (content) {
      contentWindow?.postMessage({ type: "content", content, path }, "*");
    }
  }, [content, contentWindow, path]);

  useEffect(() => {
    if (!webViewRef.current || !quickViewScript) {
      return;
    }
    const ref = webViewRef.current;
    ref.src = "";
    setTimeout(() => {
      ref.src = `data:text/html;base64,${quickViewHtmlBase64}`;
    });
    ref.onload = () => {
      if (ref.contentWindow) {
        setContentWindow(ref.contentWindow);
        ref.contentWindow.postMessage({ type: "init", js: quickViewScript }, "*");
      }
    };
  }, [fs, quickViewScript]);

  return (
    <Root>
      <WebView ref={webViewRef} title="" />
    </Root>
  );
}
