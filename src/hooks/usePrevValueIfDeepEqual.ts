import equal from "fast-deep-equal";
import { useRef } from "react";

export function usePrevValueIfDeepEqual<T>(value: T): T {
  const prevValue = useRef(value);
  if (equal(prevValue.current, value)) {
    value = prevValue.current;
  } else {
    prevValue.current = value;
  }
  return value;
}
