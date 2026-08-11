import { renderHook, act } from "@testing-library/react";
import { useContextMenuPosition } from "./useContextMenuPosition";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("useContextMenuPosition", () => {
  let floatingRef: any;
  const initialPos = { x: 100, y: 100 };
  const rightEdgePos = { x: 900, y: 100 };
  const bottomEdgePos = { x: 100, y: 900 };
  const cornerPos = { x: 900, y: 900 };

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: 1000 });

    floatingRef = {
      current: {
        getBoundingClientRect: () => ({
          width: 200,
          height: 200,
        }),
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return null if not open", () => {
    const { result } = renderHook(() =>
      useContextMenuPosition(initialPos, floatingRef, false)
    );
    expect(result.current).toBeNull();
  });

  it("should return null if mousePos is null", () => {
    const { result } = renderHook(() =>
      useContextMenuPosition(null, floatingRef, true)
    );
    expect(result.current).toBeNull();
  });

  it("should position at bottom-start if space is available", () => {
    const { result } = renderHook(() =>
      useContextMenuPosition(initialPos, floatingRef, true)
    );
    expect(result.current).toEqual({
      top: 100,
      left: 100,
      placed: "bottom-start",
    });
  });

  it("should position at bottom-end if hitting right edge", () => {
    const { result } = renderHook(() =>
      useContextMenuPosition(rightEdgePos, floatingRef, true)
    );
    expect(result.current).toEqual({
      top: 100,
      left: 700, // 900 - 200
      placed: "bottom-end",
    });
  });

  it("should position at top-start if hitting bottom edge", () => {
    const { result } = renderHook(() =>
      useContextMenuPosition(bottomEdgePos, floatingRef, true)
    );
    expect(result.current).toEqual({
      top: 700, // 900 - 200
      left: 100,
      placed: "top-start",
    });
  });

  it("should position at top-end if hitting both right and bottom edges", () => {
    const { result } = renderHook(() =>
      useContextMenuPosition(cornerPos, floatingRef, true)
    );
    expect(result.current).toEqual({
      top: 700,
      left: 700,
      placed: "top-end",
    });
  });

  it("should recalculate on window resize", () => {
    const { result } = renderHook(() =>
      useContextMenuPosition(cornerPos, floatingRef, true)
    );
    expect(result.current?.placed).toBe("top-end");

    // Make viewport bigger so it fits
    act(() => {
      window.innerWidth = 2000;
      window.innerHeight = 2000;
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current?.placed).toBe("bottom-start");
  });

  it("should recalculate on window scroll", () => {
    const { result } = renderHook(() =>
      useContextMenuPosition(cornerPos, floatingRef, true)
    );
    expect(result.current?.placed).toBe("top-end");

    act(() => {
      window.innerWidth = 2000;
      window.innerHeight = 2000;
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current?.placed).toBe("bottom-start");
  });
});
