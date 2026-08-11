import { cn } from "./cn";
import { describe, it, expect } from "vitest";

describe("cn", () => {
  it("should combine simple strings", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("should ignore falsy values", () => {
    expect(cn("a", null, "b", undefined, "", false, 0, "c")).toBe("a b c");
  });

  it("should handle numbers", () => {
    expect(cn("a", 1, "b")).toBe("a 1 b");
  });

  it("should handle arrays recursively", () => {
    expect(cn("a", ["b", "c", ["d", null, "e"]], "f")).toBe("a b c d e f");
  });

  it("should ignore empty arrays", () => {
    expect(cn("a", [], "b")).toBe("a b");
  });

  it("should handle objects based on truthiness of values", () => {
    expect(
      cn("a", { b: true, c: false, d: 1, e: 0, f: null, g: "yes" })
    ).toBe("a b d g");
  });

  it("should handle a mix of all types", () => {
    expect(
      cn(
        "string",
        ["array", { objTrue: true, objFalse: false }],
        { obj2: true },
        null,
        undefined,
        0,
        false
      )
    ).toBe("string array objTrue obj2");
  });
});
