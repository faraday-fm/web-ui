import React, { useRef, useEffect, ReactNode, CSSProperties } from "react";

interface ScrollableContainerProps {
  children: ReactNode;
  scrollHeight: number;
  scrollTop: number;
  velocityFactor?: number;
  frictionFactor?: number;
  style?: CSSProperties;
  innerContainerStyle?: CSSProperties;
  onScroll?: (scrollTop: number) => void;
}

let isTouchscreen = false;
if (window.matchMedia("(pointer: coarse)").matches) {
  isTouchscreen = true;
}

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  scrollHeight,
  scrollTop,
  velocityFactor = 20,
  frictionFactor = 0.95,
  style,
  innerContainerStyle,
  onScroll,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPaneRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(scrollTop);

  scrollTopRef.current = scrollTop;

  if (scrollPaneRef.current) {
    scrollPaneRef.current.scrollTop = scrollTop;
  }

  useEffect(() => {
    const scrollPane = scrollPaneRef.current;
    const innerContainer = containerRef.current;

    if (!scrollPane || !innerContainer) return;

    let touchStartY: number | undefined;
    let touchStartTime = 0;
    let velocity = 0;
    let isInertiaScrolling = false;

    const updateScrollTop = (scrollDelta: number) => {
      if (onScroll && scrollPaneRef.current) {
        let newScrollTop = scrollTopRef.current + scrollDelta;
        newScrollTop = Math.min(newScrollTop, scrollHeight);
        newScrollTop = Math.max(0, newScrollTop);
        if (scrollTopRef.current !== newScrollTop) {
          onScroll(newScrollTop);
        }
      }
    };

    const handleWheel = (event: WheelEvent) => {
      updateScrollTop(event.deltaY);
      event.preventDefault();
    };

    const handlePointerDown = (event: PointerEvent) => {
      console.info("***");
      touchStartY = event.clientY;
      touchStartTime = performance.now();
      isInertiaScrolling = false;
      velocity = 0;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (touchStartY == null) {
        return;
      }

      const touchCurrentY = event.clientY;
      const deltaY = touchStartY - touchCurrentY;
      if (Math.abs(deltaY) < 3) {
        return;
      }

      innerContainer.setPointerCapture(event.pointerId);
      updateScrollTop(deltaY);
      touchStartY = touchCurrentY;
      const currentTime = performance.now();
      const timeDelta = currentTime - touchStartTime;
      touchStartTime = currentTime;
      if (timeDelta > 0) {
        velocity = deltaY / timeDelta;
      }
      event.preventDefault();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (touchStartY == null) {
        return;
      }
      touchStartY = undefined;
      innerContainer.releasePointerCapture(event.pointerId);
      const inertiaScroll = () => {
        if (Math.abs(velocity) > 0.1) {
          updateScrollTop(velocity * velocityFactor);
          velocity *= frictionFactor;
          requestAnimationFrame(inertiaScroll);
        } else {
          isInertiaScrolling = false;
        }
      };
      if (!isInertiaScrolling) {
        isInertiaScrolling = true;
        requestAnimationFrame(inertiaScroll);
      }
    };

    innerContainer.addEventListener("wheel", handleWheel);
    if (isTouchscreen) {
      innerContainer.addEventListener("pointerdown", handlePointerDown);
      innerContainer.addEventListener("pointermove", handlePointerMove);
      innerContainer.addEventListener("pointerup", handlePointerUp);
      innerContainer.addEventListener("pointercancel", handlePointerUp);
    }

    return () => {
      innerContainer.removeEventListener("wheel", handleWheel);
      if (isTouchscreen) {
        innerContainer.removeEventListener("pointerdown", handlePointerDown);
        innerContainer.removeEventListener("pointermove", handlePointerMove);
        innerContainer.removeEventListener("pointerup", handlePointerUp);
        innerContainer.removeEventListener("pointercancel", handlePointerUp);
      }
    };
  }, [velocityFactor, frictionFactor, onScroll, scrollHeight]);

  return (
    <div className="AAA" style={{ overflow: "hidden", position: "relative", touchAction: "none", ...style }}>
      <div
        ref={scrollPaneRef}
        style={{
          width: "100%",
          height: "100%",
          overflowY: "scroll",
          position: "absolute",
        }}
      >
        <div style={{ height: `${scrollHeight + (scrollPaneRef.current?.clientHeight ?? 0)}px` }}></div>
      </div>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          pointerEvents: "auto",
          ...innerContainerStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollableContainer;
