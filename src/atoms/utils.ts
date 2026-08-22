import { Breakpoint } from "../hooks/use-breakpoint";

export type ResponsiveProp<T> = T | Partial<Record<Breakpoint, T>>;

export function resolveResponsive<T>(
  prop: ResponsiveProp<T> | undefined,
  activeBreakpoint: Breakpoint
): T | undefined {
  if (prop === undefined) return undefined;
  if (typeof prop !== "object" || prop === null) return prop as T;

  const responsiveObj = prop as Partial<Record<Breakpoint, T>>;
  const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
  const currentIndex = breakpoints.indexOf(activeBreakpoint);

  // Find the closest defined breakpoint at or below the current one
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpoints[i];
    if (responsiveObj[bp] !== undefined) {
      return responsiveObj[bp];
    }
  }

  return undefined;
}

export function generateResponsiveVars<T>(
  prefix: string,
  prop: ResponsiveProp<T> | undefined,
  formatter: (val: T) => string | undefined = (val) => String(val)
): Record<string, string | undefined> {
  if (prop === undefined) return {};

  const vars: Record<string, string | undefined> = {};

  if (typeof prop !== "object" || prop === null) {
    vars[`--${prefix}-base`] = formatter(prop as T);
    return vars;
  }

  const responsiveObj = prop as Partial<Record<Breakpoint | "base", T>>;

  // Always map 'xs' to 'base' if 'base' is not explicitly provided, since our hook treats xs as the lowest
  if (responsiveObj.xs !== undefined && responsiveObj.base === undefined) {
    vars[`--${prefix}-base`] = formatter(responsiveObj.xs);
  } else if (responsiveObj.base !== undefined) {
    vars[`--${prefix}-base`] = formatter(responsiveObj.base);
  }

  const bps: Breakpoint[] = ["sm", "md", "lg", "xl", "2xl"];
  bps.forEach((bp) => {
    if (responsiveObj[bp] !== undefined) {
      vars[`--${prefix}-${bp}`] = formatter(responsiveObj[bp] as T);
    }
  });

  return vars;
}

export const gapMap: Record<string, string> = {
  none: "0px",
  xs: "var(--spacing-1, 0.25rem)",
  sm: "var(--spacing-2, 0.5rem)",
  md: "var(--spacing-4, 1rem)",
  lg: "var(--spacing-6, 1.5rem)",
  xl: "var(--spacing-8, 2rem)",
};
