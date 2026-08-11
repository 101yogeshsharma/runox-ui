import { renderHook } from "@testing-library/react";
import { useThrottledEvent } from "./use-throttled-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("useThrottledEvent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should attach event listener to window by default", () => {
    const handler = vi.fn();
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useThrottledEvent("resize", handler));
    expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function), { passive: true });

    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
  });

  it("should attach event listener to provided element", () => {
    const handler = vi.fn();
    const element = document.createElement("div");
    const addEventListenerSpy = vi.spyOn(element, "addEventListener");

    renderHook(() => useThrottledEvent("click", handler, element));
    expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function), { passive: true });
  });
  
  it("should attach event listener to provided ref", () => {
    const handler = vi.fn();
    const element = document.createElement("div");
    const ref = { current: element };
    const addEventListenerSpy = vi.spyOn(element, "addEventListener");

    renderHook(() => useThrottledEvent("scroll", handler, ref));
    expect(addEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
  });

  it("should do nothing if element is null", () => {
    const handler = vi.fn();
    renderHook(() => useThrottledEvent("scroll", handler, null));
    // No error thrown
  });

  it("should throttle events", () => {
    const handler = vi.fn();
    const element = document.createElement("div");
    renderHook(() => useThrottledEvent("custom", handler, element, 100));

    const event = new Event("custom");
    
    // First trigger immediately
    element.dispatchEvent(event);
    expect(handler).toHaveBeenCalledTimes(1);

    // Second trigger within delay should be throttled
    element.dispatchEvent(event);
    expect(handler).toHaveBeenCalledTimes(1);
    
    // Fast forward halfway, still not called
    vi.advanceTimersByTime(50);
    expect(handler).toHaveBeenCalledTimes(1);
    
    // Fast forward past delay, trailing edge should trigger
    vi.advanceTimersByTime(50);
    expect(handler).toHaveBeenCalledTimes(2);
    
    // Wait for another 100ms, then trigger again
    vi.advanceTimersByTime(100);
    element.dispatchEvent(event);
    expect(handler).toHaveBeenCalledTimes(3);
  });
});
