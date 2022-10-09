import styled from "styled-components";
import FocusTrap from "focus-trap-react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useGlyphSize } from "~/src/contexts/glyphSizeContext";
import { useCommandBindings } from "~/src/hooks/useCommandBinding";
import { useCommandContext } from "~/src/hooks/useCommandContext";
import { useAppDispatch, useAppSelector } from "~/src/store";
import { ActionsBar } from "../ActionsBar/ActionsBar";
import { useFarMoreHost } from "~/src/contexts/farMoreHostContext";
import { LayoutContainer } from "../LayoutContainer/LayoutContainer";
import { focusNextPanel, focusPrevPanel, setPanelsLayout } from "~/src/features/panels/panelsSlice";

const DialogPlaceholder = lazy(() => import("~/src/components/DialogPlaceholder/DialogPlaceholder"));
// const Terminal = lazy(() => import("~/src/components/Terminal/Terminal"));

const AppDiv = styled.div`
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
    host.config.getLayout().then((l) => dispatch(setPanelsLayout(l)));
    // invoke("show_main_window");
    // if (isRunningUnderTauri()) setTimeout(() => invoke("show_main_window"), 50);
  }, [dispatch, host.config]);

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
    open: () => setDialogOpen(true),
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
        <Suspense fallback={<div />}>
          <DialogPlaceholder open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </Suspense>
        {/* <TopMenu /> */}
      </AppDiv>
    </FocusTrap>
  );
}

export default App;
