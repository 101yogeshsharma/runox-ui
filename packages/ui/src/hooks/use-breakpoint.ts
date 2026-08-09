import { useMediaQuery } from "./use-media-query";
import { breakpoints, Breakpoint } from "../tokens/breakpoints";

export type { Breakpoint };

export type ResponsiveProp<T> = T | Partial<Record<Breakpoint, T>>;

export function useBreakpoint(): Breakpoint {
  const is2Xl = useMediaQuery(`(min-width: ${breakpoints["2xl"]}px)`);
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);

  if (is2Xl) return "2xl";
  if (isXl) return "xl";
  if (isLg) return "lg";
  if (isMd) return "md";
  if (isSm) return "sm";
  return "xs";
}
