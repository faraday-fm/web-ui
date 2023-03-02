import { useElementSize } from "@hooks/useElementSize";
import { createContext, PropsWithChildren, useContext, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import useResizeObserver from "use-resize-observer";

const GlyphSizeContext = createContext({ width: 8, height: 16 });

export function useGlyphSize() {
  return useContext(GlyphSizeContext);
}

const WGlyph = styled.div`
  position: absolute;
  opacity: 0;
  user-select: none;
  pointer-events: none;
  left: -1000px;
  top: -1000px;
`;

export function GlyphSizeProvider({ children }: PropsWithChildren<unknown>) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useElementSize(ref, { width: 8, height: 16 });

  return (
    <GlyphSizeContext.Provider value={size}>
      <WGlyph aria-hidden ref={ref}>
        W
      </WGlyph>
      {children}
    </GlyphSizeContext.Provider>
  );
}
