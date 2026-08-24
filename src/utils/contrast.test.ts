import { describe, expect, it } from "vitest";
import {
  FOREGROUND_ON_DARK,
  FOREGROUND_ON_LIGHT,
  foregroundForBackground,
} from "./contrast";

describe("foregroundForBackground", () => {
  it("returns the dark foreground for light backgrounds", () => {
    expect(foregroundForBackground("#ffffff")).toBe(FOREGROUND_ON_LIGHT);
    expect(foregroundForBackground("#fafafa")).toBe(FOREGROUND_ON_LIGHT);
    expect(foregroundForBackground("#00ff00")).toBe(FOREGROUND_ON_LIGHT);
  });

  it("returns the light foreground for dark backgrounds", () => {
    expect(foregroundForBackground("#000000")).toBe(FOREGROUND_ON_DARK);
    expect(foregroundForBackground("#09090b")).toBe(FOREGROUND_ON_DARK);
    expect(foregroundForBackground("#ff0000")).toBe(FOREGROUND_ON_DARK);
  });

  it("expands 3-digit hex values", () => {
    expect(foregroundForBackground("#fff")).toBe(FOREGROUND_ON_LIGHT);
    expect(foregroundForBackground("#000")).toBe(FOREGROUND_ON_DARK);
  });

  it("accepts input without the leading hash", () => {
    expect(foregroundForBackground("ffffff")).toBe(FOREGROUND_ON_LIGHT);
    expect(foregroundForBackground("000000")).toBe(FOREGROUND_ON_DARK);
  });
});
