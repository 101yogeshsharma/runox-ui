import type { RunoxTheme } from "./defineTheme";

/**
 * Applies custom theme tokens to the given DOM element (usually HTML root).
 */
export function applyTheme(theme: RunoxTheme | undefined, root: HTMLElement): void {
  if (!theme) return;

  if (theme.fontFamily) {
    root.style.setProperty("--font-sans", theme.fontFamily);
  } else {
    root.style.removeProperty("--font-sans");
  }

  if (theme.shadowIntensity) {
    root.setAttribute("data-shadow", theme.shadowIntensity);
  } else {
    root.removeAttribute("data-shadow");
  }

  if (theme.glassBlurIntensity) {
    root.setAttribute("data-glass-blur", theme.glassBlurIntensity);
  } else {
    root.removeAttribute("data-glass-blur");
  }
}
