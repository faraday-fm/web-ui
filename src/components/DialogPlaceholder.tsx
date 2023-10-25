import { AutoHotKeyLabel } from "@components/AutoHotKeyLabel";
import { Button } from "@components/Button";
import { QuickNavigationProvider } from "@contexts/quickNavigationContext";
import { useCommandContext } from "@features/commands";
import { SyntheticEvent, useEffect, useId, useRef } from "react";
import styled, { keyframes, useTheme } from "styled-components";

import { Border } from "./Border";

interface DialogPlaceholderProps {
  open: boolean;
  onClose?: () => void;
}

const backdropAnimation = keyframes`
 0% { opacity: 0;transform: translate(-0%, -5%); }
 100% { opacity: 1;transform: translate(0%, 0%); }
`;

const Backdrop = styled.dialog.attrs({ ["popover" as never]: "manual" }).withConfig({ displayName: "Backdrop" })`
  /* background-color: ${(p) => p.theme.colors["dialog.backdrop"]}; */
  animation-name: ${backdropAnimation};
  animation-duration: 0.2s;
  padding: 0;
  border-width: 1px;
`;

const Content = styled.div.withConfig({ displayName: "Content" })`
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

const DialogButton = styled(Button).withConfig({ displayName: "DialogButton" })`
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
    /* outline: none; */
  }
`;

export default function DialogPlaceholder({ open, onClose }: DialogPlaceholderProps) {
  useCommandContext("copyDialog", open);
  const theme = useTheme();
  const dialogId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  const handleCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <QuickNavigationProvider>
      <Backdrop ref={dialogRef} onMouseDown={() => onClose?.()} onCancel={handleCancel}>
        <Content onMouseDown={(e) => e.stopPropagation()}>
          <Border $color={theme.colors["dialog.border"]}>
            <Border $color={theme.colors["dialog.border"]}>
              <p style={{ display: "flex", flexDirection: "column" }}>
                <AutoHotKeyLabel text="Copy to:" htmlFor={`${dialogId}copyTo`} />
                <input id={`${dialogId}copyTo`} />
              </p>
            </Border>
            <Border $color={theme.colors["dialog.border"]}>
              <p>
                <AutoHotKeyLabel text="Already existing files:" htmlFor={`${dialogId}alreadyExisting`} />
                <input id={`${dialogId}alreadyExisting`} />
              </p>
              <p>
                <input id={`${dialogId}processMultDist`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Process multiple destinations" htmlFor={`${dialogId}processMultDist`} />
              </p>
              <p>
                <input id={`${dialogId}copyAccessMode`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Copy files access mode" htmlFor={`${dialogId}copyAccessMode`} />
              </p>
              <p>
                <input id={`${dialogId}copyAttributes`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Copy extended attributes" htmlFor={`${dialogId}copyAttributes`} />
              </p>
              <p>
                <input id={`${dialogId}disableCache`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Disable write cache" htmlFor={`${dialogId}disableCache`} />
              </p>
              <p>
                <input id={`${dialogId}sparseFiles`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Produce sparse files" htmlFor={`${dialogId}sparseFiles`} />
              </p>
              <p>
                <input id={`${dialogId}useCopyOnWrite`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Use copy-on-write if possible" htmlFor={`${dialogId}useCopyOnWrite`} />
              </p>
              <p>
                <AutoHotKeyLabel text="With symlinks:" />
              </p>
            </Border>
            <Border $color={theme.colors["dialog.border"]}>
              <DialogButton id={`${dialogId}copy`} tabIndex={0}>
                <AutoHotKeyLabel text="Copy" htmlFor={`${dialogId}copy`} />
              </DialogButton>
              <DialogButton id={`${dialogId}tree`} tabIndex={0}>
                <AutoHotKeyLabel text="F10-Tree" htmlFor={`${dialogId}tree`} />
              </DialogButton>
              <DialogButton id={`${dialogId}filter`} tabIndex={0}>
                <AutoHotKeyLabel text="Filter" htmlFor={`${dialogId}filter`} />
              </DialogButton>
              <DialogButton id={`${dialogId}cancel`} tabIndex={0}>
                <AutoHotKeyLabel text="Cancel" htmlFor={`${dialogId}cancel`} />
              </DialogButton>
            </Border>
          </Border>
        </Content>
      </Backdrop>
    </QuickNavigationProvider>
  );
}
