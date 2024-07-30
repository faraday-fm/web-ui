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

    let touchStartY = 0;
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

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0].clientY;
      touchStartTime = Date.now();
      isInertiaScrolling = false;
      velocity = 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touchCurrentY = event.touches[0].clientY;
      const deltaY = touchStartY - touchCurrentY;
      updateScrollTop(deltaY);
      touchStartY = touchCurrentY;
      const currentTime = Date.now();
      const timeDelta = currentTime - touchStartTime;
      touchStartTime = currentTime;
      velocity = deltaY / timeDelta;
      event.preventDefault();
    };

    const handleTouchEnd = () => {
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
    innerContainer.addEventListener("touchstart", handleTouchStart);
    innerContainer.addEventListener("touchmove", handleTouchMove);
    innerContainer.addEventListener("touchend", handleTouchEnd);

    return () => {
      innerContainer.removeEventListener("wheel", handleWheel);
      innerContainer.removeEventListener("touchstart", handleTouchStart);
      innerContainer.removeEventListener("touchmove", handleTouchMove);
      innerContainer.removeEventListener("touchend", handleTouchEnd);
    };
  }, [velocityFactor, frictionFactor, onScroll, scrollHeight]);

  return (
    <div className="AAA" style={{ overflow: "hidden", position: "relative", ...style }}>
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
