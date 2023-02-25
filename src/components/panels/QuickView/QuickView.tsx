import { Border } from "@components/Border/Border";
import { setActivePanel, setPanelState } from "@features/panels/panelsSlice";
import { useCommandContext } from "@hooks/useCommandContext";
import { useFocused } from "@hooks/useFocused";
import { useFs } from "@hooks/useFs";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useAppDispatch, useAppSelector } from "@store";
import { QuickViewLayout } from "@types";
import { useEffect, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";
import useResizeObserver from "use-resize-observer";

const Root = styled.div`
  position: relative;
  width: 100%;
  background-color: ${(p) => p.theme.filePanel.bg};
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
  user-select: initial;
  -webkit-user-select: initial;
  & div {
    cursor: initial;
  }
`;

const HeaderText = styled.div<{ isActive: boolean }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  padding: 0 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 2rem);
  text-align: left;
  color: ${(p) => (p.isActive ? p.theme.filePanel.header.activeColor : p.theme.filePanel.header.inactiveColor)};
  background-color: ${(p) => (p.isActive ? p.theme.filePanel.header.activeBg : p.theme.filePanel.header.inactiveBg)};
`;

const Content = styled.div`
  display: grid;
  margin: 1px;
  border: 1px solid ${(p) => p.theme.filePanel.border.color};
  grid-template-rows: minmax(0, 1fr) auto;
  padding: 1px 1px;
  overflow: hidden;
`;

const EditorDiv = styled.div`
  display: grid;
  padding-top: calc(0.5rem);
  border: 1px solid var(--color-11);
  overflow: hidden;
`;

type QuickViewPanelProps = { layout: QuickViewLayout & { id: string } };

export function QuickView({ layout }: QuickViewPanelProps) {
  const dispatch = useAppDispatch();
  const { id, path } = layout;
  const monaco = useMonaco();
  const theme = useTheme();
  const [quickViewContent, setQuickViewContent] = useState<string>();
  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
  const isActive = useAppSelector((state) => state.panels.activePanelId === id);
  const activePath = useAppSelector((state) => {
    const ap = state.panels.states[state.panels.activePanelId ?? ""];
    return `${ap?.path}/${ap?.items[ap.cursorPos.selected]?.name}`;
  });

  const panelRootRef = useRef<HTMLDivElement>(null);
  const focused = useFocused(panelRootRef);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("far-more", {
        inherit: true,
        base: "vs-dark",
        rules: [
          {
            token: "comment",
            foreground: "ffa500",
            fontStyle: "italic underline",
          },
          { token: "comment.js", foreground: "008800", fontStyle: "bold" },
          { token: "comment.css", foreground: "0000ff" }, // will inherit fontStyle from `comment` above
        ],
        colors: {
          "editor.foreground": theme.filePanel.color, // "#2aa198",
          "editor.background": theme.filePanel.bg, // "#073642",
        },
      });
    }
  }, [monaco, theme.filePanel]);

  useEffect(() => {
    dispatch(
      setPanelState({
        id,
        state: {
          items: [],
          path: "",
          cursorPos: { selected: 0, topmost: 0 },
          view: { type: "condensed", columnDef: { name: "a", field: "a" }, columnsCount: 1 },
        },
      })
    );
  }, [dispatch, id]);

  useCommandContext("quickView.focus", focused);

  useEffect(() => {
    if (focused) {
      dispatch(setActivePanel(id));
    }
  }, [dispatch, id, focused]);

  useEffect(() => {
    if (isActive) {
      panelRootRef.current?.focus();
    }
  }, [dispatch, isActive]);

  const fs = useFs();
  useEffect(() => {
    (async () => {
      if (activePath) {
        try {
          const content = await fs.readFile(new URL(activePath));
          setQuickViewContent(new TextDecoder().decode(content));
        } catch {
          setQuickViewContent("Cannot load the file.");
        }
      } else {
        setQuickViewContent("");
      }
    })();
  }, [activePath, fs]);

  return (
    <Root ref={panelRootRef} tabIndex={0}>
      <Border {...theme.filePanel.border}>
        <HeaderText isActive={isActive}>Quick View</HeaderText>
        <Content>
          <EditorDiv ref={ref}>
            {monaco && (
              <Editor
                theme="far-more"
                width={width}
                height={height}
                value={quickViewContent}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: "off",
                  renderLineHighlight: "none",
                  scrollbar: { horizontal: "hidden", vertical: "hidden" },
                  folding: false,
                  lineNumbersMinChars: 0,
                  lineDecorationsWidth: 0,
                  overviewRulerBorder: false,
                  codeLens: false,
                  scrollBeyondLastLine: false,
                  stickyScroll: { enabled: true },
                  overviewRulerLanes: 0,
                }}
              />
            )}
          </EditorDiv>
          {/* <div className={classes.footerPanel}>123</div> */}
        </Content>
      </Border>
    </Root>
  );
}
