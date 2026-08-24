import type { RunoxTheme } from "./defineTheme";

/**
 * Applies custom theme tokens to the given DOM element (usually HTML root).
 */
export function applyTheme(
  theme: RunoxTheme | undefined,
  root: HTMLElement,
): void {
  if (!theme) return;

  if (theme.fontFamily) {
    root.style.setProperty("--font-sans", theme.fontFamily);
  } else {
    root.style.removeProperty("--font-sans");
  }

  if (theme.shadowIntensity) {
    root.dataset.shadow = theme.shadowIntensity;
  } else {
    delete root.dataset.shadow;
  }

  if (theme.glassBlurIntensity) {
    root.dataset.glassBlur = theme.glassBlurIntensity;
  } else {
    delete root.dataset.glassBlur;
  }
}
