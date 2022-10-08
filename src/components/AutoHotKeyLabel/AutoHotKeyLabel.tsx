import { PropsWithChildren, ReactElement, useRef } from "react";
import styled from "styled-components";
import { Highlight } from "~/src/components/Highlight/Highlight";
import { useQuickNavigation } from "~/src/contexts/quickNavigationContext";

type AutoHotKeyLabelProps = {
  text: string;
  labelLocation?: "left" | "right" | "bottom";
} & PropsWithChildren<unknown>;

const Label = styled.label`
  em {
    font-style: normal;
    color: var(--color-14);
  }
`;

export function AutoHotKeyLabel({ text, labelLocation = "left", children }: AutoHotKeyLabelProps): ReactElement {
  const ref = useRef<HTMLLabelElement>(null);
  const key = useQuickNavigation(text, ref);

  const items = [];

  switch (labelLocation) {
    case "left":
      items.push(<Highlight text={text} highlight={key} />);
      items.push(children);
      break;
    case "right":
      items.push(children);
      items.push(<Highlight text={text} highlight={key} />);
      break;
    case "bottom":
      items.push(<Highlight text={text} highlight={key} />);
      items.push(<br />);
      items.push(children);
      break;
  }

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <Label ref={ref}>{items}</Label>
  );
}
