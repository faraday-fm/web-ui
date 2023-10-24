import { PropsWithChildren, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import useResizeObserver from "use-resize-observer";

const Li = styled.div<{ $showOverflow: boolean; splitter: string }>`
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 2ch;
  transition: flex-shrink 0.2s;
  cursor: default;
  &:hover {
    flex-shrink: 0;
    /* text-decoration: underline; */
    &::after {
      opacity: 0;
    }
  }
  &:last-child {
    flex-shrink: 0;
    /* &::after {
      transition: 0;
    } */
  }
  &:first-child {
    min-width: 1ch;
  }
  &:first-child::before {
    content: "";
  }
  &::before {
    content: "${(p) => p.splitter ?? "/"}";
    /* content: "›";
    font-size: small;
    margin: 0 5px; */
  }
  &::after {
    position: absolute;
    content: "";
    right: 0;
    top: 0;
    bottom: 0;
    width: 2ch;
    background: var(--background);
    transition: opacity 0.2s;
    opacity: ${(p) => (p.$showOverflow ? 1 : 0)};
    pointer-events: none;
  }
`;

export function BreadcrumbItem({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  const [showOverflowAdorner, setShowOverflowAdorner] = useState(false);

  const updateOverflowAdornerVisibility = () => {
    if (ref.current) {
      setShowOverflowAdorner(ref.current.scrollWidth - ref.current.clientWidth > 0);
    }
  };

  useLayoutEffect(updateOverflowAdornerVisibility, []);
  useResizeObserver({ ref, onResize: updateOverflowAdornerVisibility });

  return (
    <Li ref={ref} splitter="/" $showOverflow={showOverflowAdorner}>
      {children}
    </Li>
  );
}
