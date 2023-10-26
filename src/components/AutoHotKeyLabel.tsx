import { Highlight } from "@components/Highlight";
import { useQuickNavigation } from "@contexts/quickNavigationContext";
import { css } from "@features/styles";
import { PropsWithChildren, ReactElement, useRef } from "react";

type AutoHotKeyLabelProps = {
  text: string;
  htmlFor?: string;
} & PropsWithChildren<unknown>;

export function AutoHotKeyLabel({ text, htmlFor }: AutoHotKeyLabelProps): ReactElement {
  const ref = useRef<HTMLLabelElement>(null);
  const key = useQuickNavigation(ref, text);

  return (
    <label className={css("AutoHotKeyLabel")} ref={ref} htmlFor={htmlFor}>
      <Highlight text={text} highlight={key} />
    </label>
  );
}
