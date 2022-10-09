/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import FocusTrap from "focus-trap-react";
import styled from "styled-components";
import { useId } from "react";
import { AutoHotKeyLabel } from "~/src/components/AutoHotKeyLabel/AutoHotKeyLabel";
import { QuickNavigationProvider } from "~/src/contexts/quickNavigationContext";
import { useCommandContext } from "~/src/hooks/useCommandContext";
import { Button } from "~/src/components/Button/Button";

type DialogPlaceholderProps = {
  open: boolean;
  onClose?: () => void;
};

const Backdrop = styled.div`
  background-color: #0003;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
`;

const Centered = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const Content = styled.div`
  background-color: var(--color-07);
  color: var(--color-01);
  box-shadow: 1rem 1rem 0 0 rgb(0 0 0 / 40%);
  padding: 0.5rem;
  p {
    margin: 0;
    padding: 1px;
  }
  input:focus {
    outline: auto;
  }
`;

const Border = styled.div`
  position: relative;
  border: 1px solid var(--color-01);
  border-bottom: none;
  padding: 1px;
  &:last-child {
    border-bottom: 1px solid var(--color-01);
  }
`;

const DialogButton = styled(Button)`
  margin: 0 10px;
`;

export default function DialogPlaceholder({ open, onClose }: DialogPlaceholderProps) {
  useCommandContext("copyDialog", open);
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
                    <AutoHotKeyLabel text="Process multiple destinations" htmlFor={`${dialogId}processMultDist`} />
                    <input id={`${dialogId}processMultDist`} type="checkbox" />
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
                  <DialogButton>
                    <AutoHotKeyLabel text="Copy" />
                  </DialogButton>
                  <DialogButton>
                    <AutoHotKeyLabel text="F10-Tree" />
                  </DialogButton>
                  <DialogButton>
                    <AutoHotKeyLabel text="Filter" />
                  </DialogButton>
                  <DialogButton>
                    <AutoHotKeyLabel text="Cancel" />
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
