import { useCallback, useEffect, useMemo, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const matchMedia = useMemo(() => window.matchMedia(query), [query]);
  const [matches, setMatches] = useState(matchMedia.matches);

  const handleChange = useCallback(() => {
    setMatches(matchMedia.matches);
  }, [matchMedia]);

  useEffect(() => {
    matchMedia.addEventListener("change", handleChange);
    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, [handleChange, matchMedia]);

  return matches;
}
