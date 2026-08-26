import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, render } from "@testing-library/react";
import { useState } from "react";
import { useReducedMotion } from "./useReducedMotion";
import { useThrottle, useThrottledCallback } from "./useThrottle";
import { useMediaQuery } from "./use-media-query";

type ChangeListener = (e: { matches: boolean }) => void;

/** Installs a controllable matchMedia mock; returns the controller. */
function installMatchMedia(initialMatches = false) {
  const listeners = new Set<ChangeListener>();
  const mql = {
    matches: initialMatches,
    addEventListener: vi.fn((_t: string, cb: ChangeListener) =>
      listeners.add(cb),
    ),
    removeEventListener: vi.fn((_t: string, cb: ChangeListener) =>
      listeners.delete(cb),
    ),
    // Legacy API — used by the Safari fallback path in useReducedMotion
    addListener: vi.fn((cb: ChangeListener) => listeners.add(cb)),
    removeListener: vi.fn((cb: ChangeListener) => listeners.delete(cb)),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );
  return {
    listeners,
    setMatches(matches: boolean) {
      mql.matches = matches;
      for (const cb of listeners) cb({ matches });
    },
    mql,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useReducedMotion", () => {
  it("returns false when prefers-reduced-motion does not match", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when prefers-reduced-motion matches", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates when the media query changes (modern API)", () => {
    const ctrl = installMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(ctrl.mql.addEventListener).toHaveBeenCalled();

    act(() => ctrl.setMatches(true));
    expect(result.current).toBe(true);

    act(() => ctrl.setMatches(false));
    expect(result.current).toBe(false);
  });

  it("falls back to legacy addListener/removeListener when modern API is absent", () => {
    const ctrl = installMatchMedia(false);
    // Simulate older Safari: no modern event API
    delete (ctrl.mql as any).addEventListener;
    delete (ctrl.mql as any).removeEventListener;

    const { result } = renderHook(() => useReducedMotion());
    expect(ctrl.mql.addListener).toHaveBeenCalled();

    act(() => ctrl.setMatches(true));
    expect(result.current).toBe(true);
  });

  it("returns false when matchMedia is unavailable", () => {
    // Simulate an environment without matchMedia (SSR-ish) without deleting
    // the whole window object, which would poison the shared jsdom env.
    vi.stubGlobal("matchMedia", undefined);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});

describe("useThrottle", () => {
  it("passes through the first value immediately", () => {
    const { result, rerender } = renderHook(({ v }) => useThrottle(v, 1000), {
      initialProps: { v: "a" },
    });
    expect(result.current).toBe("a");
    rerender({ v: "b" });
    // Within the throttle window the value is not updated yet
    expect(result.current).toBe("a");
  });

  it("updates after the interval elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useThrottle(v, 500), {
      initialProps: { v: 1 },
    });
    rerender({ v: 2 });
    expect(result.current).toBe(1);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe(2);
    vi.useRealTimers();
  });

  it("updates immediately once the interval has fully elapsed since last update", () => {
    vi.useFakeTimers();
    let now = 1000;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const { result, rerender } = renderHook(({ v }) => useThrottle(v, 100), {
      initialProps: { v: "x" },
    });
    expect(result.current).toBe("x");

    now += 200; // interval elapsed → immediate update
    rerender({ v: "y" });
    expect(result.current).toBe("y");

    vi.restoreAllMocks();
    vi.useRealTimers();
  });
});

describe("useThrottledCallback", () => {
  it("fires immediately on first call and suppresses calls within the window", () => {
    let now = 10_000; // start above lastCalled's initial 0 so first call fires
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const fn = vi.fn((x: number) => x * 2);
    const { result } = renderHook(() => useThrottledCallback(fn, 100));

    expect(result.current(1)).toBe(2);
    expect(fn).toHaveBeenCalledTimes(1);

    now = 10_050; // inside window
    expect(result.current(2)).toBeUndefined();
    expect(fn).toHaveBeenCalledTimes(1);

    now = 10_150; // outside window
    expect(result.current(3)).toBe(6);
    expect(fn).toHaveBeenCalledTimes(2);

    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("always invokes the latest callback (fnRef pattern)", () => {
    let now = 10_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const first = vi.fn();
    const second = vi.fn();

    const { result, rerender } = renderHook(
      ({ fn }) => useThrottledCallback(fn, 100),
      { initialProps: { fn: first } },
    );
    result.current();
    expect(first).toHaveBeenCalledTimes(1);

    now = 10_200;
    rerender({ fn: second });
    result.current();
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });
});

describe("useMediaQuery", () => {
  function Probe({ query }: { query: string }) {
    const matches = useMediaQuery(query);
    return <span data-testid="out">{String(matches)}</span>;
  }

  it("reflects current match state via matchMedia", () => {
    installMatchMedia(true);
    const { getByTestId } = render(<Probe query="(min-width: 768px)" />);
    expect(getByTestId("out").textContent).toBe("true");
  });

  it("re-renders when the media query changes", () => {
    const ctrl = installMatchMedia(false);
    const { getByTestId } = render(<Probe query="(min-width: 768px)" />);
    expect(getByTestId("out").textContent).toBe("false");

    act(() => ctrl.setMatches(true));
    expect(getByTestId("out").textContent).toBe("true");
  });

  it("unsubscribes on unmount", () => {
    const ctrl = installMatchMedia(false);
    const { unmount } = render(<Probe query="(min-width: 768px)" />);
    expect(ctrl.mql.removeEventListener).not.toHaveBeenCalled();
    unmount();
    expect(ctrl.mql.removeEventListener).toHaveBeenCalled();
  });

  it("uses a controllable hook-driven source with useState interplay", () => {
    // Sanity check that hooks compose normally under the mocked environment.
    installMatchMedia(false);
    function Harness() {
      const [q, setQ] = useState("(min-width: 1px)");
      const matches = useMediaQuery(q);
      return (
        <button onClick={() => setQ("(max-width: 1px)")} data-testid="btn">
          {String(matches)}
        </button>
      );
    }
    const { getByTestId } = render(<Harness />);
    expect(getByTestId("btn").textContent).toBe("false");
  });
});
