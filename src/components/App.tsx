import defaultLayout from "@assets/layout.json5";
import { ActionsBar } from "@components/ActionsBar";
import DialogPlaceholder from "@components/DialogPlaceholder";
import { LayoutContainer } from "@components/LayoutContainer";
import { useFaradayHost } from "@contexts/faradayHostContext";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import { changeDir, focusNextPanel, setPanelsLayout } from "@features/panels/panelsSlice";
import { useCommandBindings } from "@hooks/useCommandBinding";
import { useCommandContext } from "@hooks/useCommandContext";
import { useFileContent } from "@hooks/useFileContent";
import { useAppDispatch, useAppSelector } from "@store";
import { PanelsLayout } from "@types";
import FocusTrap from "focus-trap-react";
import JSON5 from "json5";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

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

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [panelsOpen, setPanelsOpen] = useState(true);
  const [executing, setExecuting] = useState(false);
  const panelsLayout = useAppSelector((state) => state.panels.layout);
  const host = useFaradayHost();

  const { content: layoutContent } = useFileContent("faraday:/layout.json");
  useEffect(() => {
    if (layoutContent) {
      try {
        const layout = JSON5.parse(decoder.decode(layoutContent)) as PanelsLayout;
        dispatch(setPanelsLayout(layout));
      } catch {
        dispatch(setPanelsLayout(JSON5.parse(defaultLayout)));
      }
    }
    // invoke("show_main_window");
    // if (isRunningUnderTauri()) setTimeout(() => invoke("show_main_window"), 50);
  }, [dispatch, layoutContent]);

  useCommandContext("isDesktop", host.config.isDesktop());

  useCommandBindings({
    togglePanels: () => {
      setPanelsOpen((p) => !p);
    },
    focusNextPanel: () => {
      dispatch(focusNextPanel({ backward: false }));
    },
    focusPrevPanel: () => {
      dispatch(focusNextPanel({ backward: true }));
    },
    // open: () => setDialogOpen(true),
    open: () => {
      dispatch(changeDir());
    },
    openShell: () => console.error("OPEN_SHELL"),
  });

  // const leftItems = useMemo(() => Array.from(Array(300).keys()).map((i) => ({ name: i.toString(), size: Math.round(Math.random() * 100000000) })), []);
  const { height: glyphHeight } = useGlyphSize();

  const onRunStart = useCallback(() => setExecuting(true), []);
  const onRunEnd = useCallback(() => setExecuting(false), []);

  if (!panelsLayout) {
    return null;
  }

  return (
    <FocusTrap>
      <AppDiv ref={rootRef}>
        <div style={{ gridRow: 1, position: "relative", overflow: "hidden" }}>
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
        </div>
        <div style={{ gridRow: 2, overflow: "hidden" }}>
          <ActionsBar />
        </div>
        <DialogPlaceholder open={dialogOpen} onClose={() => setDialogOpen(false)} />
        {/* <TopMenu /> */}
      </AppDiv>
    </FocusTrap>
  );
}

export default App;
