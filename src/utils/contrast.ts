/**
 * Foreground color constants used for automatic contrast resolution.
 * Kept here so the values exist in exactly one module.
 */
export const FOREGROUND_ON_LIGHT = "#09090b";
export const FOREGROUND_ON_DARK = "#fafafa";

/**
 * Resolves a readable foreground color for the given background hex value
 * using the YIQ luminance formula.
 *
 * @param hex - Background color as `#rgb`, `#rrggbb`, or without the leading `#`.
 * @returns The foreground hex constant with the best contrast against the input.
 */
export function foregroundForBackground(hex: string): string {
  let value = hex.replace("#", "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 128 ? FOREGROUND_ON_LIGHT : FOREGROUND_ON_DARK;
}
