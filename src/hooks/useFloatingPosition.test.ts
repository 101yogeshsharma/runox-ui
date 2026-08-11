import { renderHook, act } from "@testing-library/react";
import { useFloatingPosition } from "./useFloatingPosition";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("useFloatingPosition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: 1000 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockRef = (rect: any) => ({
    current: {
      getBoundingClientRect: () => rect,
    } as any,
  });

  it("should return null if not active", () => {
    const anchorRef = createMockRef({});
    const floatingRef = createMockRef({});
    
    const { result } = renderHook(() => 
      useFloatingPosition(anchorRef, floatingRef, false)
    );
    expect(result.current).toBeNull();
  });

  it("should calculate position for bottom start", () => {
    const anchorRef = createMockRef({ top: 100, left: 100, bottom: 150, right: 200, width: 100, height: 50 });
    const floatingRef = createMockRef({ width: 200, height: 200 });
    
    const { result } = renderHook(() => 
      useFloatingPosition(anchorRef, floatingRef, true, 8, null, "bottom", "start")
    );
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toEqual({
      top: 158, // 150 + 8
      left: 100,
      placed: "bottom",
    });
  });

  it("should flip to top if bottom overflows", () => {
    // anchor near bottom of viewport
    const anchorRef = createMockRef({ top: 900, left: 100, bottom: 950, right: 200, width: 100, height: 50 });
    const floatingRef = createMockRef({ width: 200, height: 200 });
    
    const { result } = renderHook(() => 
      useFloatingPosition(anchorRef, floatingRef, true, 8, null, "bottom", "start")
    );
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toEqual({
      top: 692, // 900 - 200 - 8
      left: 100,
      placed: "top",
    });
  });

  it("should calculate position for top center", () => {
    const anchorRef = createMockRef({ top: 500, left: 500, bottom: 550, right: 600, width: 100, height: 50 });
    const floatingRef = createMockRef({ width: 200, height: 200 });
    
    const { result } = renderHook(() => 
      useFloatingPosition(anchorRef, floatingRef, true, 8, null, "top", "center")
    );
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toEqual({
      top: 292, // 500 - 200 - 8
      left: 450, // 500 + 100/2 - 200/2 = 550 - 100 = 450
      placed: "top",
    });
  });

  it("should calculate position for right end", () => {
    const anchorRef = createMockRef({ top: 500, left: 500, bottom: 550, right: 600, width: 100, height: 50 });
    const floatingRef = createMockRef({ width: 200, height: 200 });
    
    const { result } = renderHook(() => 
      useFloatingPosition(anchorRef, floatingRef, true, 8, null, "right", "end")
    );
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toEqual({
      top: 350, // 550 - 200
      left: 608, // 600 + 8
      placed: "right",
    });
  });

  it("should flip to left if right overflows", () => {
    const anchorRef = createMockRef({ top: 500, left: 900, bottom: 550, right: 1000, width: 100, height: 50 });
    const floatingRef = createMockRef({ width: 200, height: 200 });
    
    const { result } = renderHook(() => 
      useFloatingPosition(anchorRef, floatingRef, true, 8, null, "right", "center")
    );
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toEqual({
      top: 425, // 500 + 25 - 100
      left: 692, // 900 - 200 - 8
      placed: "left",
    });
  });
});
