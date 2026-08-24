import type { RunoxTheme } from "./defineTheme";
import { foregroundForBackground } from "./contrast";
import type { ThemeConfig } from "../components/ThemeProvider";

/**
 * Generates a CSS string containing the CSS variable definitions for the given RunoxTheme and ThemeConfig.
 * This is primarily used by the Theme Builder to export raw CSS.
 */
export function generateCSSVariables(
  theme: RunoxTheme,
  config: Partial<ThemeConfig> = {},
): string {
  const vars: string[] = [];

  // Density handling
  if (config.density === "compact") {
    vars.push("  --rnx-space-scale: 0.75;", "  --rnx-text-scale: 0.95;");
  } else if (config.density === "spacious") {
    vars.push("  --rnx-space-scale: 1.25;", "  --rnx-text-scale: 1.05;");
  }

  // Tokens handling
  if (theme.primaryColor) {
    if (theme.primaryColor.startsWith("#")) {
      vars.push(
        `  --primary: ${theme.primaryColor};`,
        `  --primary-foreground: ${foregroundForBackground(theme.primaryColor)};`,
      );
    } else {
      // Named colors would map to tailwind var if we supported it fully in CSS output,
      // but typically users exporting raw CSS want the hex values.
      // We will leave named colors out of the raw CSS export for simplicity,
      // or assume they use the predefined data-color themes.
    }
  }

  if (theme.radius) {
    if (theme.radius === "none") {
      vars.push(`  --radius: 0px;`);
    } else {
      vars.push(`  --radius: var(--radius-${theme.radius});`);
    }
  }

  if (theme.fontFamily) {
    vars.push(`  --font-sans: ${theme.fontFamily};`);
  }

  if (theme.shadowIntensity) {
    const shadowMap: Record<string, number> = {
      none: 0,
      sm: 0.05,
      md: 0.1,
      lg: 0.2,
    };
    vars.push(
      `  --shadow-intensity: ${shadowMap[theme.shadowIntensity] ?? 0.1};`,
    );
  }

  if (theme.glassBlurIntensity) {
    const blurMap: Record<string, string> = {
      none: "0px",
      sm: "6px",
      md: "16px",
      lg: "36px",
    };
    vars.push(
      `  --glass-blur: ${blurMap[theme.glassBlurIntensity] ?? "16px"};`,
    );
  }

  if (vars.length === 0) return "";

  return `:root {\n${vars.join("\n")}\n}`;
}
