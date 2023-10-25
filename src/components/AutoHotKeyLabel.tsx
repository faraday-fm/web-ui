import { Highlight } from "@components/Highlight";
import { useQuickNavigation } from "@contexts/quickNavigationContext";
import { PropsWithChildren, ReactElement, useRef } from "react";
import styled from "styled-components";

type AutoHotKeyLabelProps = {
  text: string;
  htmlFor?: string;
} & PropsWithChildren<unknown>;

const Label = styled.label`
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  em {
    font-style: normal;
    color: ${(p) => p.theme.colors["textAcceleratorKey.foreground"]};
  }
`;

export function AutoHotKeyLabel({ text, htmlFor }: AutoHotKeyLabelProps): ReactElement {
  const ref = useRef<HTMLLabelElement>(null);
  const key = useQuickNavigation(ref, text);

  return (
    <Label ref={ref} htmlFor={htmlFor}>
      <Highlight text={text} highlight={key} />
    </Label>
  );
}
