import { renderHook } from "@testing-library/react";
import { useHotkeys } from "./useHotkeys";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("useHotkeys", () => {
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const dispatchKey = (key: string, modifiers: Record<string, boolean> = {}) => {
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...modifiers,
    });
    window.dispatchEvent(event);
  };

  it("should trigger callback on basic key match", () => {
    renderHook(() => useHotkeys("a", callback));
    
    dispatchKey("A");
    expect(callback).toHaveBeenCalledTimes(1);
    
    dispatchKey("b");
    expect(callback).toHaveBeenCalledTimes(1); // Still 1
  });

  it("should trigger callback on modifier match", () => {
    renderHook(() => useHotkeys("cmd+s", callback));
    
    dispatchKey("s", { metaKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
    
    dispatchKey("s", { ctrlKey: true }); // Missing metaKey
    expect(callback).toHaveBeenCalledTimes(1); 
  });

  it("should handle ctrl, shift, alt modifiers", () => {
    renderHook(() => useHotkeys("ctrl+shift+alt+k", callback));
    
    dispatchKey("k", { ctrlKey: true, shiftKey: true, altKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should handle special key names (esc, space)", () => {
    const escCallback = vi.fn();
    const spaceCallback = vi.fn();
    
    renderHook(() => useHotkeys("esc", escCallback));
    renderHook(() => useHotkeys("space", spaceCallback));
    
    dispatchKey("Escape");
    expect(escCallback).toHaveBeenCalledTimes(1);
    
    dispatchKey(" ");
    expect(spaceCallback).toHaveBeenCalledTimes(1);
  });

  it("should handle legacy cmd+k override", () => {
    renderHook(() => useHotkeys("cmd+k", callback));
    
    // Test the legacy cmd+k fallback explicitly (even if modifiers mismatch slightly)
    dispatchKey("k", { ctrlKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });
  
  it("should prevent default event action on match", () => {
    renderHook(() => useHotkeys("cmd+p", callback));
    
    const event = new KeyboardEvent("keydown", {
      key: "p",
      metaKey: true,
      cancelable: true,
    });
    
    const preventSpy = vi.spyOn(event, "preventDefault");
    window.dispatchEvent(event);
    
    expect(preventSpy).toHaveBeenCalled();
  });
});
