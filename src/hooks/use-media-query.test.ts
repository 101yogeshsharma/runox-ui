import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "./use-media-query";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("useMediaQuery", () => {
  let addListener: any;
  let removeListener: any;
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    addListener = vi.fn();
    removeListener = vi.fn();
    addEventListenerSpy = vi.fn();
    removeEventListenerSpy = vi.fn();
    
    vi.useFakeTimers();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === "(min-width: 768px)", // Mock true for this query
        media: query,
        onchange: null,
        addListener, // Deprecated
        removeListener, // Deprecated
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return true for matching query", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });
  
  it("should return false for non-matching query", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(false);
  });



  it("should handle change events and throttle them", () => {
    // Need to save the registered event handler
    let registeredHandler: any;
    addEventListenerSpy.mockImplementation((event: string, handler: any) => {
      if (event === "change") {
        registeredHandler = handler;
      }
    });

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    
    // Initially false
    expect(result.current).toBe(false);

    act(() => {
      // Simulate that the media query now matches
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      // Fire change event
      if (registeredHandler) {
        registeredHandler(new Event("change"));
      }
    });

    // Throttled event is immediate on first call
    expect(result.current).toBe(true);
  });
});
