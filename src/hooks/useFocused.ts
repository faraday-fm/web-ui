import { type RefObject, useEffect, useState } from "react";

export function useFocused(ref: RefObject<HTMLElement> | HTMLElement | null | undefined) {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!ref) {
      return undefined;
    }
    let el: HTMLElement | null;
    if (ref instanceof HTMLElement) {
      el = ref;
    } else {
      el = ref.current;
    }
    if (!el) {
      return undefined;
    }
    const focus = (e: FocusEvent) => {
      setFocused(el?.contains(e.target as Element) ?? false);
    };
    document.addEventListener("focus", focus, { capture: true });
    return () => {
      document.removeEventListener("focus", focus);
    };

    // console.error(document.activeElement);
    // setFocused(el === document.activeElement || el.contains(document.activeElement));
    // const focus = () => setFocused(true);
    // const blur = () => setFocused(false);
    // return undefined;
    // el.addEventListener("focusin", focus);
    // el.addEventListener("focusout", blur);
    // return () => {
    //   el?.removeEventListener("focusin", focus);
    //   el?.removeEventListener("focusout", blur);
    // };
  }, [ref]);
  return focused;
}
