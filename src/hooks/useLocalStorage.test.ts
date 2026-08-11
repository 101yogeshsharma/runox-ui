import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should return the initial value if localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("should return the value from localStorage if it exists", () => {
    window.localStorage.setItem("test-key", JSON.stringify("stored-value"));
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("stored-value");
  });

  it("should handle invalid JSON in localStorage gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    window.localStorage.setItem("test-key", "{invalid json}");
    
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should update localStorage when setValue is called", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    
    act(() => {
      result.current[1]("new-value");
    });
    
    expect(result.current[0]).toBe("new-value");
    expect(window.localStorage.getItem("test-key")).toBe(JSON.stringify("new-value"));
  });

  it("should handle functional updates", () => {
    const { result } = renderHook(() => useLocalStorage("count", 0));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem("count")).toBe("1");

    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    
    expect(result.current[0]).toBe(2);
    expect(window.localStorage.getItem("count")).toBe("2");
  });

  it("should sync state when storage event fires", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    
    act(() => {
      // Simulate storage event from another tab
      const event = new StorageEvent("storage", {
        key: "test-key",
        newValue: JSON.stringify("external-value"),
      });
      window.dispatchEvent(event);
    });
    
    expect(result.current[0]).toBe("external-value");
  });
  
  it("should ignore storage events for other keys", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    
    act(() => {
      const event = new StorageEvent("storage", {
        key: "other-key",
        newValue: JSON.stringify("external-value"),
      });
      window.dispatchEvent(event);
    });
    
    expect(result.current[0]).toBe("default");
  });
});
