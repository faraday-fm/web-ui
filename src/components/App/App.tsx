//import { invoke } from "@tauri-apps/api";
import { ReduxFilePanel } from "~/src/components/hocs/ReduxFilePanel";
import { FilePanelActions } from "~/src/components/panels/FilePanel/FilePanel";
import { useGlyphSize } from "~/src/contexts/glyphSizeContext";
import FocusTrap from "focus-trap-react";
import { useCommandBindings } from "~/src/hooks/useCommandBinding";
import { useCommandContext } from "~/src/hooks/useCommandContext";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useAppSelector } from "~/src/store";
import styled from "styled-components";
import { isRunningUnderTauri } from "~/src/utils/tauriUtils";

import { ActionsBar } from "../ActionsBar/ActionsBar";

const DialogPlaceholder = lazy(() => import("~/src/components/DialogPlaceholder/DialogPlaceholder"));
const Terminal = lazy(() => import("~/src/components/Terminal/Terminal"));

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
  const activePanel = useAppSelector((state) => state.panels.active);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [panelsOpen, setPanelsOpen] = useState(true);
  const [executing, setExecuting] = useState(false);
  const panel1Ref = useRef<FilePanelActions>(null);
  const panel2Ref = useRef<FilePanelActions>(null);

  useEffect(() => {
    // invoke("show_main_window");
    // if (isRunningUnderTauri()) setTimeout(() => invoke("show_main_window"), 50);
  }, []);

  useCommandContext("isDesktop", isRunningUnderTauri());

  const [viewType, setViewType] = useState(0);
  useCommandBindings({
    togglePanels: () => {
      setPanelsOpen((p) => !p);
    },
    focusNextPanel: () => {
      if (activePanel === "left") panel2Ref.current?.focus();
      if (activePanel === "right") panel1Ref.current?.focus();
    },
    focusActivePanel: () => {
      if (activePanel === "left") panel1Ref.current?.focus();
      if (activePanel === "right") panel2Ref.current?.focus();
    },
    switchView: () => setViewType((vt) => vt + 1),
    open: () => setDialogOpen(true),
    openShell: () => console.error("OPEN_SHELL"),
  });

  // const leftItems = useMemo(() => Array.from(Array(300).keys()).map((i) => ({ name: i.toString(), size: Math.round(Math.random() * 100000000) })), []);
  const { height: glyphHeight } = useGlyphSize();

  const onRunStart = useCallback(() => setExecuting(true), []);
  const onRunEnd = useCallback(() => setExecuting(false), []);

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
            <ReduxFilePanel
              id="left"
              ref={panel1Ref}
              // showCursorWhenBlurred={activePanel === 0}
              // items={leftItems}
              // view={
              //   viewType % 2 === 0
              //     ? {
              //         type: "full",
              //         columnDefs: [
              //           { field: "name", name: "Name", width: "1fr" },
              //           { field: "size", name: "Size" },
              //           { field: "attr", name: "Attr" },
              //         ],
              //       }
              //     : { type: "condenced", columnDef: { field: "name", name: "Name" } }
              // }
            />
            <ReduxFilePanel id="right" ref={panel2Ref} />
            {/* <FilePanel
              ref={panel2Ref}
              onFocus={() => setActivePanel(1)}
              showCursorWhenBlurred={activePanel === 1}
              items={Array.from(Array(30).keys()).map((i) => ({ name: i.toString() }))}
              view={{ type: "condenced", columnDef: { field: "name", name: "Name" } }}
            /> */}
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
