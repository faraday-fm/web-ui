import { Border } from "@components/Border";
import { PanelHeader } from "@components/PanelHeader";
import { setActivePanel } from "@features/panels/panelsSlice";
import { useCommandContext } from "@hooks/useCommandContext";
import { useFileContent } from "@hooks/useFileContent";
import { useFocused } from "@hooks/useFocused";
import { useAppDispatch, useAppSelector } from "@store";
import { QuickViewLayout } from "@types";
import { useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components";

import QuickViewHost from "./QuickViewHost";

const Root = styled.div`
  position: relative;
  width: 100%;
  color: ${(p) => p.theme.colors["panel.foreground"]};
  background-color: ${(p) => p.theme.colors["panel.background"]};
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
  /* position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  padding: 0 0.5ch;
  white-space: nowrap; */
  overflow: hidden;
  /* text-overflow: ellipsis;
  max-width: calc(100% - 2rem);
  text-align: left; */
  color: ${(p) => p.theme.colors[p.isActive ? "panel.header.foreground:focus" : "panel.header.foreground"]};
  background-color: ${(p) => p.theme.colors[p.isActive ? "panel.header.background:focus" : "panel.header.background"]};
`;

const Content = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`;

type QuickViewPanelProps = { layout: QuickViewLayout & { id: string } };

export function QuickView({ layout }: QuickViewPanelProps) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { id } = layout;
  const activePanelId = useAppSelector((state) => state.panels.activePanelId);
  const isActive = activePanelId === id;
  const activePath = useAppSelector((state) => state.globalContext["filePanel.selectedPath"]);

  const panelRootRef = useRef<HTMLDivElement>(null);
  const focused = useFocused(panelRootRef);

  useCommandContext("quickView.visible");
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

  const { content, path: contentPath, error } = useFileContent(activePath ?? "");

  return (
    <Root ref={panelRootRef} tabIndex={0}>
      <Border $color={focused ? theme.colors["panel.border:focus"] : theme.colors["panel.border"]}>
        <Content>
          <PanelHeader $active={isActive}>Quick View</PanelHeader>
          <QuickViewHost content={content} path={contentPath} />
        </Content>
      </Border>
    </Root>
  );
}
