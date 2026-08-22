import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBreakpoint } from "./use-breakpoint";
import { useMediaQuery } from "./use-media-query";

vi.mock("./use-media-query", () => ({
  useMediaQuery: vi.fn(),
}));

const mockedUseMediaQuery = vi.mocked(useMediaQuery);

describe("useBreakpoint", () => {
  beforeEach(() => {
    mockedUseMediaQuery.mockReset();
  });

  it.each([
    ["2xl", [true, false, false, false, false]],
    ["xl", [false, true, false, false, false]],
    ["lg", [false, false, true, false, false]],
    ["md", [false, false, false, true, false]],
    ["sm", [false, false, false, false, true]],
    ["xs", [false, false, false, false, false]],
  ] as const)("returns %s", (expected, matches) => {
    mockedUseMediaQuery.mockImplementation((query) => {
      const index = ["2xl", "xl", "lg", "md", "sm"].findIndex((name) =>
        query.includes(
          name === "2xl"
            ? "1536"
            : name === "xl"
              ? "1280"
              : name === "lg"
                ? "1024"
                : name === "md"
                  ? "768"
                  : "640",
        ),
      );
      return matches[index] ?? false;
    });

    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe(expected);
  });
});
