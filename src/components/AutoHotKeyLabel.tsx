import { type PropsWithChildren, type ReactElement, useRef } from "react";
import { useQuickNavigation } from "../contexts/quickNavigationContext";
import { css } from "../features/styles";
import { Highlight } from "./Highlight";

type AutoHotKeyLabelProps = {
  text: string;
  htmlFor?: string;
} & PropsWithChildren<unknown>;

export function AutoHotKeyLabel({ text, htmlFor }: AutoHotKeyLabelProps): ReactElement {
  const ref = useRef<HTMLLabelElement>(null);
  const key = useQuickNavigation(ref, text);

  return (
    <label className={css("auto-hotkey-label")} ref={ref} htmlFor={htmlFor}>
      <Highlight text={text} highlight={key} />
    </label>
  );
}
