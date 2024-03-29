import { RefObject, useLayoutEffect, useState } from "react";
import useResizeObserver from "use-resize-observer";

interface ElementSize {
  width: number;
  height: number;
}

export function useElementSize<T extends Element>(ref: RefObject<T>, defaultSize?: ElementSize) {
  const [size, setSize] = useState(defaultSize ?? { width: 8, height: 16 });

  useLayoutEffect(() => {
    if (ref.current) {
      setSize(ref.current.getBoundingClientRect());
    }
  }, [ref]);

  useResizeObserver({ ref, round: (n) => n, onResize: (size) => setSize(size as DOMRect) });

  return size;
}
