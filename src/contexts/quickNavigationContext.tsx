import { createContext, PropsWithChildren, RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const QuickNavigationContext = createContext(new Map<string, RefObject<HTMLElement>>());

export function useQuickNavigation(text: string, ref: RefObject<HTMLElement>) {
  const context = useContext(QuickNavigationContext);
  const [hotKey, setHotKey] = useState<string>();

  useEffect(() => {
    let key: string | undefined;
    for (let i = 0; i < text.length; i += 1) {
      const c = text[i].toLowerCase();
      if (!context.has(c)) {
        context.set(c, ref);
        key = c;
        break;
      }
    }
    setHotKey(key);
    return () => {
      if (key) context.delete(key);
    };
  }, [context, ref, text]);

  return hotKey;
}

export function QuickNavigationProvider({ children }: PropsWithChildren) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapping = useMemo(() => new Map<string, RefObject<HTMLElement>>(), []);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowUp": {
          const tabbedElements = containerRef.current?.querySelectorAll("input, button, select, textarea, a[href]");
          const elementsArray = Array.from(tabbedElements?.values() ?? []) as HTMLElement[];
          let currIndex = elementsArray.indexOf(e.target as HTMLElement);
          if (currIndex >= 0) {
            currIndex -= 1;
            if (currIndex < 0) currIndex = elementsArray.length - 1;
            elementsArray[currIndex].focus();
          }
          break;
        }
        case "ArrowDown": {
          const tabbedElements = containerRef.current?.querySelectorAll("input, button, select, textarea, a[href]");
          const elementsArray = Array.from(tabbedElements?.values() ?? []) as HTMLElement[];
          let currIndex = elementsArray.indexOf(e.target as HTMLElement);
          if (currIndex >= 0) {
            currIndex += 1;
            if (currIndex >= elementsArray.length) currIndex = 0;
            elementsArray[currIndex].focus();
          }
          break;
        }
        default:
          const ref = mapping.get(e.key.toLowerCase());
          if (ref) {
            e.preventDefault();
            e.stopPropagation();
            ref.current?.focus();
            ref.current?.click();
          }
          break;
      }
    },
    [mapping]
  );
  return (
    <QuickNavigationContext.Provider value={mapping}>
      <div ref={containerRef} onKeyDownCapture={onKeyDown} role="button" tabIndex={0}>
        {children}
      </div>
    </QuickNavigationContext.Provider>
  );
}
