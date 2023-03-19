/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { AutoHotKeyLabel } from "@components/AutoHotKeyLabel";
import { Button } from "@components/Button";
import { QuickNavigationProvider } from "@contexts/quickNavigationContext";
import { useCommandContext } from "@hooks/useCommandContext";
import FocusTrap from "focus-trap-react";
import { useId } from "react";
import styled, { keyframes, useTheme } from "styled-components";

import { Border } from "./Border";

type DialogPlaceholderProps = {
  open: boolean;
  onClose?: () => void;
};

const backdropAnimation = keyframes`
 0% { opacity: 0 }
 100% { opacity: 1 }
`;

const centeredAnimation = keyframes`
 0% { transform: translate(-50%, -55%);}
 100% { transform: translate(-50%, -50%); }
`;

const Backdrop = styled.div`
  background-color: ${(p) => p.theme.colors["dialog.backdrop"]};
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  animation-name: ${backdropAnimation};
  animation-duration: 0.2s;
`;

const Centered = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation-name: ${centeredAnimation};
  animation-duration: 0.2s;
`;

const Content = styled.div`
  background-color: ${(p) => p.theme.colors["dialog.background"]};
  color: ${(p) => p.theme.colors["dialog.foreground"]};
  box-shadow: ${(p) => p.theme.colors["dialog.shadow"]};
  padding: 0.5rem;
  p {
    margin: 0;
    padding: 1px;
  }
  input:focus {
    outline: auto;
  }
`;

const DialogButton = styled(Button)`
  margin: 0 0.25em;
  background-color: transparent;
  &:before {
    content: "[ ";
  }
  &:after {
    content: " ]";
  }
  &:focus {
    background-color: var(--color-11);
    outline: none;
  }
`;

export default function DialogPlaceholder({ open, onClose }: DialogPlaceholderProps) {
  useCommandContext("copyDialog", open);
  const theme = useTheme();
  const dialogId = useId();

  if (!open) return null;

  return (
    <QuickNavigationProvider>
      <FocusTrap focusTrapOptions={{ onDeactivate: () => onClose?.() }}>
        <Backdrop role="dialog" aria-modal="true" onMouseDown={() => onClose?.()}>
          <Centered onMouseDown={(e) => e.stopPropagation()}>
            <Content>
              <Border>
                <Border>
                  <p style={{ display: "flex", flexDirection: "column" }}>
                    <AutoHotKeyLabel text="Copy to:" htmlFor={`${dialogId}copyTo`} />
                    <input id={`${dialogId}copyTo`} />
                  </p>
                </Border>
                <Border>
                  <p>
                    <AutoHotKeyLabel text="Already existing files:" htmlFor={`${dialogId}alreadyExisting`} />
                    <input id={`${dialogId}alreadyExisting`} />
                  </p>
                  <p>
                    <input id={`${dialogId}processMultDist`} type="checkbox" />
                    <AutoHotKeyLabel text="Process multiple destinations" htmlFor={`${dialogId}processMultDist`} />
                  </p>
                  <p>
                    <input id={`${dialogId}copyAccessMode`} type="checkbox" />
                    <AutoHotKeyLabel text="Copy files access mode" htmlFor={`${dialogId}copyAccessMode`} />
                  </p>
                  <p>
                    <input id={`${dialogId}copyAttributes`} type="checkbox" />
                    <AutoHotKeyLabel text="Copy extended attributes" htmlFor={`${dialogId}copyAttributes`} />
                  </p>
                  <p>
                    <input id={`${dialogId}disableCache`} type="checkbox" />
                    <AutoHotKeyLabel text="Disable write cache" htmlFor={`${dialogId}disableCache`} />
                  </p>
                  <p>
                    <input id={`${dialogId}sparseFiles`} type="checkbox" />
                    <AutoHotKeyLabel text="Produce sparse files" htmlFor={`${dialogId}sparseFiles`} />
                  </p>
                  <p>
                    <input id={`${dialogId}useCopyOnWrite`} type="checkbox" />
                    <AutoHotKeyLabel text="Use copy-on-write if possible" htmlFor={`${dialogId}useCopyOnWrite`} />
                  </p>
                  <p>
                    <AutoHotKeyLabel text="With symlinks:" />
                  </p>
                </Border>
                <Border>
                  <DialogButton id={`${dialogId}copy`}>
                    <AutoHotKeyLabel text="Copy" htmlFor={`${dialogId}copy`} />
                  </DialogButton>
                  <DialogButton id={`${dialogId}tree`}>
                    <AutoHotKeyLabel text="F10-Tree" htmlFor={`${dialogId}tree`} />
                  </DialogButton>
                  <DialogButton id={`${dialogId}filter`}>
                    <AutoHotKeyLabel text="Filter" htmlFor={`${dialogId}filter`} />
                  </DialogButton>
                  <DialogButton id={`${dialogId}cancel`}>
                    <AutoHotKeyLabel text="Cancel" htmlFor={`${dialogId}cancel`} />
                  </DialogButton>
                </Border>
              </Border>
            </Content>
          </Centered>
        </Backdrop>
      </FocusTrap>
    </QuickNavigationProvider>
  );
}
