import { createContext, PropsWithChildren, useContext } from "react";
import useResizeObserver from "use-resize-observer";

const GlyphSizeContext = createContext({ width: 8, height: 16 });

export function useGlyphSize() {
  return useContext(GlyphSizeContext);
}

export function GlyphSizeProvider({ children }: PropsWithChildren<unknown>) {
  const { ref, width = 8, height = 16 } = useResizeObserver<HTMLDivElement>({ round: (n) => n });
  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <GlyphSizeContext.Provider value={{ width, height }}>
      <div
        aria-hidden
        ref={ref}
        style={{
          position: "absolute",
          opacity: 0,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        W
      </div>
      {children}
    </GlyphSizeContext.Provider>
  );
}
