import { useState, useEffect, useMemo } from "react";
import { useThrottledEvent } from "./use-throttled-event";

export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  const matchMedia = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query);
    }
    return null;
  }, [query]);

  useThrottledEvent(
    "change",
    () => {
      setMatches(getMatches(query));
    },
    matchMedia,
    100
  );

  useEffect(() => {
    setMatches(getMatches(query));
  }, [query]);

  return matches;
}
