import type { RunoxTheme } from "./defineTheme";
import type { ThemeConfig } from "../components/ThemeProvider";

/**
 * Generates a CSS string containing the CSS variable definitions for the given RunoxTheme and ThemeConfig.
 * This is primarily used by the Theme Builder to export raw CSS.
 */
export function generateCSSVariables(
  theme: RunoxTheme,
  config: Partial<ThemeConfig> = {}
): string {
  const vars: string[] = [];

  // Density handling
  if (config.density === "compact") {
    vars.push("  --rnx-space-scale: 0.75;");
    vars.push("  --rnx-text-scale: 0.95;");
  } else if (config.density === "spacious") {
    vars.push("  --rnx-space-scale: 1.25;");
    vars.push("  --rnx-text-scale: 1.05;");
  }

  // Tokens handling
  if (theme.primaryColor) {
    if (theme.primaryColor.startsWith("#")) {
      vars.push(`  --primary: ${theme.primaryColor};`);
      let hex = theme.primaryColor.replace("#", "");
      if (hex.length === 3) {
        hex = hex.split("").map((c) => c + c).join("");
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      const fg = yiq >= 128 ? "#09090b" : "#fafafa";
      vars.push(`  --primary-foreground: ${fg};`);
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
    vars.push(`  --shadow-intensity: ${shadowMap[theme.shadowIntensity] ?? 0.1};`);
  }

  if (theme.glassBlurIntensity) {
    const blurMap: Record<string, string> = {
      none: "0px",
      sm: "4px",
      md: "12px",
      lg: "24px",
    };
    vars.push(`  --glass-blur: ${blurMap[theme.glassBlurIntensity] ?? "12px"};`);
  }

  if (vars.length === 0) return "";

  return `:root {\n${vars.join("\n")}\n}`;
}
