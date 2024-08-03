import { type RefObject, useLayoutEffect, useState } from "react";
import { useResizeObserver } from "./useResizeObserver";

interface ElementSize {
  width: number;
  height: number;
}

export function useElementSize<T extends HTMLElement>(ref: RefObject<T>, defaultSize?: ElementSize) {
  const [size, setSize] = useState(defaultSize ?? { width: 8, height: 16 });

  useLayoutEffect(() => {
    if (ref.current) {
      setSize(ref.current.getBoundingClientRect());
    }
  }, [ref]);

  useResizeObserver({
    ref,
    onResize: (size) => setSize(size as DOMRect),
  });

  return size;
}
