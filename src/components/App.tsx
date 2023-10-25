import defaultLayout from "@assets/layout.json5";
import { ActionsBar } from "@components/ActionsBar";
import DialogPlaceholder from "@components/DialogPlaceholder";
import { LayoutContainer } from "@components/LayoutContainer";
import { useFaradayHost } from "@contexts/faradayHostContext";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import styled from "@emotion/styled";
import { useCommandBindings, useCommandContext } from "@features/commands";
import { useFileContent } from "@features/fs/hooks";
import { usePanels } from "@features/panels";
import { PanelsLayout } from "@types";
import JSON5 from "json5";
import { useEffect, useRef, useState } from "react";

// const Terminal = lazy(() => import("@components/Terminal/Terminal"));

const decoder = new TextDecoder();

const AppDiv = styled.div`
  font-size: 14px;
  button,
  input {
    font-family: inherit;
    text-rendering: inherit;
    font-size: inherit;
  }
  font-family: ${(p) => p.theme.fontFamily};
  text-rendering: geometricPrecision;
  background-color: #172637;
  height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  flex-direction: column;
  direction: ltr;
`;

const MainDiv = styled.div`
  grid-row: 1;
  position: relative;
  overflow: hidden;
`;

const FooterDiv = styled.div`
  grid-row: 2;
  overflow: hidden;
`;

const TerminalContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
`;

const PanelsContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 17px;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  z-index: 0;
`;

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
    togglePanels: () => {
      setPanelsOpen((p) => !p);
    },
    focusNextPanel: () => {
      focusNextPanel(false);
    },
    focusPrevPanel: () => {
      focusNextPanel(true);
    },
    // open: () => setDialogOpen(true),
    open: () => {
      changeDir();
    },
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
    <AppDiv ref={rootRef}>
      <MainDiv>
        <TerminalContainer>
          {/* <Suspense fallback={<div />}>
              <Terminal fullScreen={!panelsOpen} onRunStart={onRunStart} onRunEnd={onRunEnd} />
            </Suspense> */}
        </TerminalContainer>
        <PanelsContainer
          style={{
            display: "grid",
            opacity: !executing && panelsOpen ? 1 : 0,
            pointerEvents: !executing && panelsOpen ? "all" : "none",
            bottom: glyphHeight,
          }}
        >
          {panelsLayout && <LayoutContainer layout={panelsLayout} direction="h" />}
        </PanelsContainer>
      </MainDiv>
      <FooterDiv>
        <ActionsBar />
      </FooterDiv>
      <DialogPlaceholder open={dialogOpen} onClose={() => setDialogOpen(false)} />
      {/* <TopMenu /> */}
    </AppDiv>
  );
}
