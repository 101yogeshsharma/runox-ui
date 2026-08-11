import { renderHook, act, cleanup } from "@testing-library/react";
import { useIntersectionObserver } from "./useIntersectionObserver";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: any) {
    (window as any)._triggerIO = callback;
  }
  observe = mockObserve;
  disconnect = () => {
    mockDisconnect();
    (window as any)._triggerIO = null;
  };
  unobserve = vi.fn();
}

window.IntersectionObserver = MockIntersectionObserver as any;

describe("useIntersectionObserver", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
  });
  
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("should return undefined initially", () => {
    const ref = { current: document.createElement("div") };
    const { result } = renderHook(() => useIntersectionObserver(ref));
    expect(result.current).toBeUndefined();
  });

  it("should initialize IntersectionObserver and observe the element", () => {
    const el = document.createElement("div");
    const ref = { current: el };
    
    renderHook(() => useIntersectionObserver(ref));
    expect(mockObserve).toHaveBeenCalledWith(el);
  });

  it("should handle late ref attachment via interval", () => {
    const ref: any = { current: null };
    const { unmount } = renderHook(() => useIntersectionObserver(ref));

    expect(mockObserve).not.toHaveBeenCalled();

    // Attach ref later
    const el = document.createElement("div");
    ref.current = el;

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(mockObserve).toHaveBeenCalledWith(el);
    unmount();
  });

  it("should update entry when observer fires", () => {
    const ref = { current: document.createElement("div") };
    const { result } = renderHook(() => useIntersectionObserver(ref));

    act(() => {
      if ((window as any)._triggerIO) {
        (window as any)._triggerIO([{ isIntersecting: true, intersectionRatio: 1 }]);
      }
    });

    expect(result.current?.isIntersecting).toBe(true);
  });

  it("should disconnect observer on unmount", () => {
    const ref = { current: document.createElement("div") };
    const { unmount } = renderHook(() => useIntersectionObserver(ref));
    
    unmount();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it("should freeze once visible if freezeOnceVisible is true", () => {
    const ref = { current: document.createElement("div") };
    const { result, rerender } = renderHook(() => 
      useIntersectionObserver(ref, { freezeOnceVisible: true })
    );

    act(() => {
      if ((window as any)._triggerIO) {
        (window as any)._triggerIO([{ isIntersecting: true }]);
      }
    });

    expect(result.current?.isIntersecting).toBe(true);
    
    // Rerender triggers the early return if frozen
    rerender();
    
    act(() => {
      if ((window as any)._triggerIO) {
        (window as any)._triggerIO([{ isIntersecting: false }]);
      }
    });

    // Should still be true because it froze
    expect(result.current?.isIntersecting).toBe(true);
  });
});
