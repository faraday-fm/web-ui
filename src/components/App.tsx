import defaultLayout from "@assets/layout.json5";
import { ActionsBar } from "@components/ActionsBar";
import DialogPlaceholder from "@components/DialogPlaceholder";
import { LayoutContainer } from "@components/LayoutContainer";
import { useFaradayHost } from "@contexts/faradayHostContext";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import { useCommandBindings, useCommandContext } from "@features/commands";
import { useFileContent } from "@features/fs/hooks";
import { usePanels } from "@features/panels";
import { css } from "@features/styles";
import { PanelsLayout } from "@types";
import JSON5 from "json5";
import { useEffect, useRef, useState } from "react";

// const Terminal = lazy(() => import("@components/Terminal/Terminal"));

const decoder = new TextDecoder();

export function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [panelsOpen, setPanelsOpen] = useState(true);
  const [executing] = useState(false);
  const { layout: panelsLayout, setPanelsLayout, focusNextPanel, changeDir } = usePanels();
  const host = useFaradayHost();

  const { content: layoutContent } = useFileContent("faraday:/layout.json5");
  useEffect(() => {
    if (layoutContent) {
      try {
        const layout: PanelsLayout = JSON5.parse(decoder.decode(layoutContent));
        setPanelsLayout(layout);
      } catch {
        setPanelsLayout(JSON5.parse(defaultLayout));
      }
    }
    // invoke("show_main_window");
    // if (isRunningUnderTauri()) setTimeout(() => invoke("show_main_window"), 50);
  }, [layoutContent, setPanelsLayout]);

  useCommandContext("isDesktop", host.config.isDesktop());

  useCommandBindings({
    togglePanels: () => setPanelsOpen((p) => !p),
    focusNextPanel: () => focusNextPanel(false),
    focusPrevPanel: () => focusNextPanel(true),
    // open: () => setDialogOpen(true),
    open: () => changeDir(),
    openShell: () => setDialogOpen(true),
  });

  // const leftItems = useMemo(() => Array.from(Array(300).keys()).map((i) => ({ name: i.toString(), size: Math.round(Math.random() * 100000000) })), []);
  const { height: glyphHeight } = useGlyphSize();

  // const onRunStart = useCallback(() => setExecuting(true), []);
  // const onRunEnd = useCallback(() => setExecuting(false), []);

  if (!panelsLayout) {
    return null;
  }

  return (
    <div className={css("App")} ref={rootRef}>
      <div className={css("MainDiv")}>
        <div className={css("TerminalContainer")}>
          {/* <Suspense fallback={<div />}>
              <Terminal fullScreen={!panelsOpen} onRunStart={onRunStart} onRunEnd={onRunEnd} />
            </Suspense> */}
        </div>
        <div
          className={css("PanelsContainer")}
          style={{
            opacity: !executing && panelsOpen ? 1 : 0,
            pointerEvents: !executing && panelsOpen ? "all" : "none",
            bottom: glyphHeight,
          }}
        >
          {panelsLayout && <LayoutContainer layout={panelsLayout} direction="h" />}
        </div>
      </div>
      <div className={css("FooterDiv")}>
        <ActionsBar />
      </div>
      <DialogPlaceholder open={dialogOpen} onClose={() => setDialogOpen(false)} />
      {/* <TopMenu /> */}
    </div>
  );
}
