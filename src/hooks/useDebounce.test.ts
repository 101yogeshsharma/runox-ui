import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("should debounce the value change", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    expect(result.current).toBe("initial");

    // Update value
    rerender({ value: "updated", delay: 500 });
    
    // Should still be initial before delay
    expect(result.current).toBe("initial");

    // Fast-forward half the delay
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe("initial");

    // Fast-forward the rest of the delay
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe("updated");
  });

  it("should reset the timer if value changes before delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    rerender({ value: "updated 1", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Update again before timer finishes
    rerender({ value: "updated 2", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(250); // Total 500ms since first update, but only 250ms since second
    });
    
    // Still not updated
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(250); // Now 500ms since second update
    });

    expect(result.current).toBe("updated 2");
  });
});
