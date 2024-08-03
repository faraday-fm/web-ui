import { type PropsWithChildren, createContext, useContext, useRef } from "react";
import { useElementSize } from "../hooks/useElementSize";

const GlyphSizeContext = createContext({ width: 8, height: 16 });

export function useGlyphSize() {
  return useContext(GlyphSizeContext);
}

export function GlyphSizeProvider({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useElementSize(ref, { width: 8, height: 16 });

  return (
    <GlyphSizeContext.Provider value={size}>
      <div
        aria-hidden
        ref={ref}
        style={{
          position: "absolute",
          opacity: 0,
          userSelect: "none",
          pointerEvents: "none",
          left: -1000,
          top: -1000,
        }}
      >
        W
      </div>
      {children}
    </GlyphSizeContext.Provider>
  );
}
