export interface RunoxTheme {
  primaryColor?: string;
  accentColor?: string;
  radius?: "none" | "sm" | "md" | "lg" | "xl";
  fontFamily?: string;
  shadowIntensity?: "none" | "sm" | "md" | "lg";
  glassBlurIntensity?: "none" | "sm" | "md" | "lg";
}

/**
 * A helper function to provide type-safety and autocomplete
 * when defining a RunoxTheme object.
 */
export function defineTheme(theme: RunoxTheme): RunoxTheme {
  return theme;
}
