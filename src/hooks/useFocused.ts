import { RefObject, useEffect, useState } from "react";

export function useFocused(ref: RefObject<HTMLElement> | HTMLElement | null | undefined) {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!ref) return undefined;
    let el: HTMLElement | null;
    if (ref instanceof HTMLElement) {
      el = ref;
    } else {
      el = ref.current;
    }
    if (document.activeElement === el) {
      setFocused(true);
    }
    if (!el) return undefined;
    const focus = () => setFocused(true);
    const blur = () => setFocused(false);
    el.addEventListener("focus", focus);
    el.addEventListener("blur", blur);
    return () => {
      el?.removeEventListener("focus", focus);
      el?.removeEventListener("blur", blur);
    };
  }, [ref]);
  return focused;
}
