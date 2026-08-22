import { describe, expect, it } from "vitest";
import { applyTheme } from "./applyTheme";

describe("applyTheme", () => {
  it("applies and clears custom theme tokens", () => {
    const root = document.createElement("div");

    applyTheme(
      {
        fontFamily: "Inter",
        shadowIntensity: "lg",
        glassBlurIntensity: "sm",
      },
      root,
    );
    expect(root.style.getPropertyValue("--font-sans")).toBe("Inter");
    expect(root).toHaveAttribute("data-shadow", "lg");
    expect(root).toHaveAttribute("data-glass-blur", "sm");

    applyTheme({}, root);
    expect(root.style.getPropertyValue("--font-sans")).toBe("");
    expect(root).not.toHaveAttribute("data-shadow");
    expect(root).not.toHaveAttribute("data-glass-blur");
  });
});
