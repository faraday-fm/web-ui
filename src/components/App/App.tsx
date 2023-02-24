import { ActionsBar } from "@components/ActionsBar/ActionsBar";
import DialogPlaceholder from "@components/DialogPlaceholder/DialogPlaceholder";
import { LayoutContainer } from "@components/LayoutContainer/LayoutContainer";
import { useFarMoreHost } from "@contexts/farMoreHostContext";
import { useGlyphSize } from "@contexts/glyphSizeContext";
import { changeDir, focusNextPanel, setPanelsLayout } from "@features/panels/panelsSlice";
import { useCommandBindings } from "@hooks/useCommandBinding";
import { useCommandContext } from "@hooks/useCommandContext";
import { useAppDispatch, useAppSelector } from "@store";
import { PanelsLayout } from "@types";
import FocusTrap from "focus-trap-react";
import JSON5 from "json5";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

// const Terminal = lazy(() => import("@components/Terminal/Terminal"));

const decoder = new TextDecoder();

const AppDiv = styled.div`
  button,
  input {
    font-family: inherit;
    text-rendering: inherit;
    font-size: inherit;
  }
  font-family: ${(p) => p.theme.fontFamily};
  text-rendering: geometricPrecision;
  background-color: ${(p) => p.theme.primaryBg};
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
  const host = useFarMoreHost();

  useEffect(() => {
    (async () => {
      const layoutContent = await host.fs.readFile(new URL("far-more:/layout.json"));
      const layout = JSON5.parse(decoder.decode(layoutContent)) as PanelsLayout;
      dispatch(setPanelsLayout(layout));
    })();
    // invoke("show_main_window");
    // if (isRunningUnderTauri()) setTimeout(() => invoke("show_main_window"), 50);
  }, [dispatch, host.config, host.fs]);

  useCommandContext("isDesktop", host.config.isDesktop());

  const [viewType, setViewType] = useState(0);
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
    focusActivePanel: () => {
      // if (activePanel === "left") panel1Ref.current?.focus();
      // if (activePanel === "right") panel2Ref.current?.focus();
    },
    switchView: () => setViewType((vt) => vt + 1),
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
