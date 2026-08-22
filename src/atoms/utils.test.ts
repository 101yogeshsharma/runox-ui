import { describe, expect, it } from "vitest";
import { generateResponsiveVars, resolveResponsive } from "./utils";

describe("responsive atom utilities", () => {
  it("resolves the closest configured breakpoint", () => {
    expect(resolveResponsive({ sm: "small", lg: "large" }, "md")).toBe("small");
    expect(resolveResponsive({ sm: "small", lg: "large" }, "xl")).toBe("large");
    expect(resolveResponsive({ base: "base" }, "xs")).toBeUndefined();
    expect(resolveResponsive("fixed", "md")).toBe("fixed");
    expect(resolveResponsive(undefined, "md")).toBeUndefined();
  });

  it("generates base and breakpoint CSS variables", () => {
    expect(generateResponsiveVars("gap", "md")).toEqual({
      "--gap-base": "md",
    });
    expect(
      generateResponsiveVars("gap", { xs: "xs", md: "md", "2xl": "wide" }),
    ).toEqual({
      "--gap-base": "xs",
      "--gap-md": "md",
      "--gap-2xl": "wide",
    });
    expect(generateResponsiveVars("gap", { base: "base", sm: "sm" })).toEqual({
      "--gap-base": "base",
      "--gap-sm": "sm",
    });
    expect(generateResponsiveVars("gap", undefined)).toEqual({});
  });
});
