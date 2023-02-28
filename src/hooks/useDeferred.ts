import { useEffect, useState } from "react";

export function useDeferred<T>(value: T, interval: number): T {
  const [result, setResult] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setResult(value), interval);
    return () => clearTimeout(timeoutId);
  }, [interval, value]);

  return result;
}
