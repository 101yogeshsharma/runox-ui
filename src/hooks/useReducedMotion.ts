import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Subscribes to the user's `prefers-reduced-motion` setting.
 *
 * Returns `true` when the user has requested reduced motion, `false`
 * otherwise. Falls back to `false` (and never subscribes) in non-browser
 * environments.
 *
 * Use this to skip or shorten animations:
 *
 * ```tsx
 * const reduced = useReducedMotion();
 * <Modal disableExitAnimation={reduced} ... />
 * ```
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    // Modern API first; fall back for older Safari.
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return reduced;
}
