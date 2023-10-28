/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { SyntheticEvent, useEffect, useId, useRef } from "react";
import { Border } from "./Border";
import { useCommandContext } from "../features/commands";
import { QuickNavigationProvider } from "../contexts/quickNavigationContext";
import { css } from "../features/styles";
import { AutoHotKeyLabel } from "./AutoHotKeyLabel";

interface DialogPlaceholderProps {
  open: boolean;
  onClose?: () => void;
}

export default function DialogPlaceholder({ open, onClose }: DialogPlaceholderProps) {
  useCommandContext("copyDialog", open);
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
      <dialog className={css("DialogBackdrop")} ref={dialogRef} onMouseDown={() => onClose?.()} onCancel={handleCancel} {...{ popover: "manual" }}>
        <div className={css("DialogContent")} onMouseDown={(e) => e.stopPropagation()}>
          <Border color={"dialog-border"}>
            <Border color={"dialog-border"}>
              <p style={{ display: "flex", flexDirection: "column" }}>
                <AutoHotKeyLabel text="Copy to:" htmlFor={`${dialogId}copyTo`} />
                <input id={`${dialogId}copyTo`} />
              </p>
            </Border>
            <Border color={"dialog-border"}>
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
            <Border color={"dialog-border"}>
              <button className={css("DialogButton")} id={`${dialogId}copy`} tabIndex={0}>
                <AutoHotKeyLabel text="Copy" htmlFor={`${dialogId}copy`} />
              </button>
              <button className={css("DialogButton")} id={`${dialogId}tree`} tabIndex={0}>
                <AutoHotKeyLabel text="F10-Tree" htmlFor={`${dialogId}tree`} />
              </button>
              <button className={css("DialogButton")} id={`${dialogId}filter`} tabIndex={0}>
                <AutoHotKeyLabel text="Filter" htmlFor={`${dialogId}filter`} />
              </button>
              <button className={css("DialogButton")} id={`${dialogId}cancel`} tabIndex={0}>
                <AutoHotKeyLabel text="Cancel" htmlFor={`${dialogId}cancel`} />
              </button>
            </Border>
          </Border>
        </div>
      </dialog>
    </QuickNavigationProvider>
  );
}
