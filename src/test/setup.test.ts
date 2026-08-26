import { describe, it, expect } from "vitest";
import { setupRunoxTests } from "./setup";

describe("setupRunoxTests", () => {
  it("is idempotent — repeated calls don't stack cleanup handlers or break", () => {
    expect(() => {
      setupRunoxTests();
      setupRunoxTests();
    }).not.toThrow();
  });

  it("installs a working matchMedia mock", () => {
    setupRunoxTests();
    const mql = window.matchMedia("(min-width: 768px)");
    expect(mql.matches).toBe(false);
    expect(mql.media).toBe("(min-width: 768px)");
    expect(typeof mql.addEventListener).toBe("function");
  });

  it("installs the ResizeObserver stub when absent", () => {
    const original = globalThis.ResizeObserver;
    // @ts-expect-error simulate absence
    delete globalThis.ResizeObserver;
    try {
      setupRunoxTests();
      expect(typeof globalThis.ResizeObserver).toBe("function");
      const ro = new globalThis.ResizeObserver(() => {});
      expect(() => ro.observe(document.body)).not.toThrow();
      expect(() => ro.unobserve(document.body)).not.toThrow();
      expect(() => ro.disconnect()).not.toThrow();
    } finally {
      globalThis.ResizeObserver = original;
    }
  });

  it("does not overwrite an existing ResizeObserver", () => {
    class CustomRO {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    const original = globalThis.ResizeObserver;
    globalThis.ResizeObserver = CustomRO as any;
    try {
      setupRunoxTests();
      expect(globalThis.ResizeObserver).toBe(CustomRO);
    } finally {
      globalThis.ResizeObserver = original;
    }
  });

  it("polyfills PointerEvent only when missing", () => {
    const original = window.PointerEvent;
    // @ts-expect-error simulate absence
    delete (window as any).PointerEvent;
    try {
      setupRunoxTests();
      expect(typeof window.PointerEvent).toBe("function");
      const ev = new window.PointerEvent("pointerdown", {
        pointerId: 7,
        pointerType: "pen",
        isPrimary: true,
      });
      expect(ev.pointerId).toBe(7);
      expect(ev.pointerType).toBe("pen");
      expect(ev.isPrimary).toBe(true);
    } finally {
      if (original) window.PointerEvent = original;
    }
  });

  it("mocks element scroll/pointer-capture methods", () => {
    setupRunoxTests();
    const el = document.createElement("div");
    expect(() => el.scrollIntoView()).not.toThrow();
    expect(el.hasPointerCapture(0)).toBe(false);
    expect(() => el.setPointerCapture(0)).not.toThrow();
    expect(() => el.releasePointerCapture(0)).not.toThrow();
  });

  it("respects skip options", () => {
    const original = window.PointerEvent;
    // @ts-expect-error simulate absence
    delete (window as any).PointerEvent;
    try {
      setupRunoxTests({
        skipMatchMedia: true,
        skipResizeObserver: true,
        skipPointerEvent: true,
        skipElementMocks: true,
        skipCleanup: true,
      });
      // Nothing was installed
      expect(window.PointerEvent).toBeUndefined();
    } finally {
      if (original) window.PointerEvent = original;
    }
  });
});
