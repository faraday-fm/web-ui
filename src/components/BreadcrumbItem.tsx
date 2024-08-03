import { type PropsWithChildren, useLayoutEffect, useRef, useState } from "react";
import { css } from "../features/styles";
import { useResizeObserver } from "../hooks/useResizeObserver";

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
    <div className={css("breadcrumb-item", showOverflowAdorner ? "-showOverflow" : "")} ref={ref}>
      {children}
    </div>
  );
}
