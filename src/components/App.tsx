import JSON5 from "json5";
import { useEffect, useRef, useState } from "react";
import defaultLayout from "../assets/layout.json5";
import { ActionsBar } from "../components/ActionsBar";
import DialogPlaceholder from "../components/DialogPlaceholder";
import { LayoutContainer } from "../components/LayoutContainer";
import { useFaradayHost } from "../contexts/faradayHostContext";
import { useGlyphSize } from "../contexts/glyphSizeContext";
import { useCommandBindings, useSetContextVariables } from "../features/commands";
import { useFileContent } from "../features/fs/hooks";
import { usePanels } from "../features/panels";
import { css } from "../features/styles";
import { PanelsLayout } from "../types";
import { useInert } from "../features/inert/hooks";

// const Terminal = lazy(() => import("@components/Terminal/Terminal"));

const decoder = new TextDecoder();

export function App() {
  const { inert } = useInert();
  const rootRef = useRef<HTMLDivElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [panelsOpen, setPanelsOpen] = useState(true);
  const [executing] = useState(false);
  const { layout, setPanelsLayout, focusNextPanel, enterDir } = usePanels();
  const host = useFaradayHost();
  const [devMode, setDevMode] = useState(false);

  const { content: layoutContent } = useFileContent("~/.faraday/layout.json5");
  useEffect(() => {
    if (layoutContent) {
      try {
        const layout: PanelsLayout = JSON5.parse(decoder.decode(layoutContent));
        setPanelsLayout(layout);
      } catch {
        setPanelsLayout(JSON5.parse(defaultLayout));
      }
    }
  }, [layoutContent, setPanelsLayout]);

  useSetContextVariables("isDesktop", host.config.isDesktop());
  useSetContextVariables("devMode", devMode);

  useCommandBindings({
    togglePanels: () => setPanelsOpen((p) => !p),
    focusNextPanel: () => focusNextPanel(false),
    focusPrevPanel: () => focusNextPanel(true),
    // open: () => setDialogOpen(true),
    open: () => enterDir(),
    openShell: () => setDialogOpen(true),
    copyFiles: () => setDialogOpen(true),
    switchDevMode: () => setDevMode((d) => !d),
  });

  // const leftItems = useMemo(() => Array.from(Array(300).keys()).map((i) => ({ name: i.toString(), size: Math.round(Math.random() * 100000000) })), []);
  const { height: glyphHeight } = useGlyphSize();

  // const onRunStart = useCallback(() => setExecuting(true), []);
  // const onRunEnd = useCallback(() => setExecuting(false), []);

  if (!layout) {
    return null;
  }

  return (
    <div className={css("app")} ref={rootRef} {...{ inert: inert ? "" : undefined }}>
      <div className={css("main-div")}>
        <div className={css("terminal-container")}>
          {/* <Suspense fallback={<div />}>
              <Terminal fullScreen={!panelsOpen} onRunStart={onRunStart} onRunEnd={onRunEnd} />
            </Suspense> */}
        </div>
        <div
          className={css("panels-container")}
          style={{
            opacity: !executing && panelsOpen ? 1 : 0,
            pointerEvents: !executing && panelsOpen ? "all" : "none",
            bottom: glyphHeight,
          }}
        >
          {layout && <LayoutContainer layout={layout} direction="h" />}
        </div>
      </div>
      <div className={css("footer-div")}>
        <ActionsBar />
      </div>
      <DialogPlaceholder open={dialogOpen} onClose={() => setDialogOpen(false)} />
      {/* <TopMenu /> */}
    </div>
  );
}
