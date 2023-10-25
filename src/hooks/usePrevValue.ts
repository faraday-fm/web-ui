import { useEffect, useRef } from "react";

export function usePrevValue<T>(value: T): T {
  const prevValue = useRef(value);
  useEffect(() => {
    prevValue.current = value;
  }, [value]);
  return prevValue.current;
}
