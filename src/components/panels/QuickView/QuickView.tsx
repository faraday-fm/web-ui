import { Border } from "@components/Border/Border";
import { setActivePanel } from "@features/panels/panelsSlice";
import { useCommandContext } from "@hooks/useCommandContext";
import { useFileContent } from "@hooks/useFileContent";
import { useFocused } from "@hooks/useFocused";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useAppDispatch, useAppSelector } from "@store";
import { QuickViewLayout } from "@types";
import { append } from "@utils/urlUtils";
import { useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";

const Root = styled.div`
  position: relative;
  width: 100%;
  background-color: ${(p) => p.theme.filePanel.bg};
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
  user-select: initial;
  & div {
    cursor: initial;
  }
  &:focus {
    outline: none;
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
  padding: 0.5ch 0 0 0.25ch;
  overflow: hidden;
`;

type QuickViewPanelProps = { layout: QuickViewLayout & { id: string } };

export function QuickView({ layout }: QuickViewPanelProps) {
  const dispatch = useAppDispatch();
  const { id } = layout;
  const monaco = useMonaco();
  const theme = useTheme();
  // const [quickViewContent, setQuickViewContent] = useState<string>();
  const isActive = useAppSelector((state) => state.panels.activePanelId === id);
  const activePath = useAppSelector((state) => {
    const ap = state.panels.states[state.panels.activePanelId ?? ""];
    if (!ap) {
      return undefined;
    }
    const item = ap.items[ap.cursorPos.selected];
    if (!item) {
      return undefined;
    }
    return append(ap.path, item.name, item.isDir ?? false).href;
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
  }, [monaco, theme.filePanel.bg, theme.filePanel.color]);

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

  const { content, error } = useFileContent(decodeURI(activePath ?? ""));

  let quickViewContent: string;
  if (error) {
    quickViewContent = String(error);
  } else if (content !== undefined) {
    quickViewContent = new TextDecoder().decode(content);
  } else {
    quickViewContent = "Loading...";
  }

  return (
    <Root ref={panelRootRef} tabIndex={0}>
      <Border {...theme.filePanel.border}>
        <HeaderText isActive={isActive}>Quick View</HeaderText>
        <Content>
          {monaco && (
            <Editor
              theme="far-more"
              path={activePath}
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
          {/* <div className={classes.footerPanel}>123</div> */}
        </Content>
      </Border>
    </Root>
  );
}
