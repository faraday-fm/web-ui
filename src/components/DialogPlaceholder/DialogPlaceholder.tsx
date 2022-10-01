/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { AutoHotKeyLabel } from "~/src/components/AutoHotKeyLabel/AutoHotKeyLabel";
import { QuickNavigationProvider } from "~/src/contexts/quickNavigationContext";
import FocusTrap from "focus-trap-react";
import { useCommandContext } from "~/src/hooks/useCommandContext";
import styled from "styled-components";

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
`;

export default function DialogPlaceholder({ open, onClose }: DialogPlaceholderProps) {
  useCommandContext("copyDialog", open);

  if (!open) return null;

  return (
    <QuickNavigationProvider>
      <FocusTrap focusTrapOptions={{ onDeactivate: () => onClose?.() }}>
        <Backdrop role="dialog" aria-modal="true" onMouseDown={() => onClose?.()}>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }} onMouseDown={(e) => e.stopPropagation()}>
            <Content>
              <Border>
                <Border>
                  <p>
                    <AutoHotKeyLabel text="Copy to:" labelLocation="bottom">
                      <input />
                    </AutoHotKeyLabel>
                  </p>
                </Border>
                <Border>
                  <p>
                    <AutoHotKeyLabel text="Already existing files:">
                      <input />
                    </AutoHotKeyLabel>
                  </p>
                  <p>
                    <AutoHotKeyLabel text="Process multiple destinations" labelLocation="right">
                      <input type="checkbox" />
                    </AutoHotKeyLabel>
                  </p>
                  <p>
                    <AutoHotKeyLabel text="Copy files access mode" labelLocation="right">
                      <input type="checkbox" />
                    </AutoHotKeyLabel>
                  </p>
                  <p>
                    <AutoHotKeyLabel text="Copy extended attributes" labelLocation="right">
                      <input type="checkbox" />
                    </AutoHotKeyLabel>
                  </p>
                  <p>
                    <AutoHotKeyLabel text="Disable write cache" labelLocation="right">
                      <input type="checkbox" />
                    </AutoHotKeyLabel>
                  </p>
                  <p>
                    <AutoHotKeyLabel text="Produce sparse files" labelLocation="right">
                      <input type="checkbox" />
                    </AutoHotKeyLabel>
                  </p>
                  <p>
                    <AutoHotKeyLabel text="Use copy-on-write if possible" labelLocation="right">
                      <input type="checkbox" />
                    </AutoHotKeyLabel>
                  </p>
                  <p>
                    <AutoHotKeyLabel text="With symlinks:" />
                  </p>
                </Border>
                <Border>
                  <button type="button">dfg</button>
                  <button type="button">dfg</button>
                </Border>
              </Border>
            </Content>
          </div>
        </Backdrop>
      </FocusTrap>
    </QuickNavigationProvider>
  );
}
