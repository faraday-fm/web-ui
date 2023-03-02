import { RefObject, useLayoutEffect, useState } from "react";
import useResizeObserver from "use-resize-observer";

type ElementSize = { width: number; height: number };

export function useElementSize<T extends Element>(ref: RefObject<T>, defaultSize?: ElementSize) {
  const [size, setSize] = useState(defaultSize ?? { width: 0, height: 0 });

  useLayoutEffect(() => {
    if (ref.current) {
      setSize(ref.current.getBoundingClientRect());
    }
  }, [ref]);
  useResizeObserver({ ref, round: (n) => n, onResize: (size) => setSize(size as DOMRect) });

  return size;
}
