import { createContext, PropsWithChildren, RefObject, useCallback, useContext, useEffect, useMemo, useState } from "react";

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

export function QuickNavigationProvider({ children }: PropsWithChildren<unknown>) {
  const mapping = useMemo(() => new Map<string, RefObject<HTMLElement>>(), []);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const ref = mapping.get(e.key.toLowerCase());
      if (ref) {
        e.preventDefault();
        e.stopPropagation();
        ref.current?.focus();
        ref.current?.click();
      }
    },
    [mapping]
  );
  return (
    <QuickNavigationContext.Provider value={mapping}>
      <div onKeyDownCapture={onKeyDown} role="button" tabIndex={0}>
        {children}
      </div>
    </QuickNavigationContext.Provider>
  );
}
