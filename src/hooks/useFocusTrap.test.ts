import { renderHook, act, render, fireEvent } from "@testing-library/react";
import { useFocusTrap } from "./useFocusTrap";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("useFocusTrap", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not trap focus if not active", () => {
    const div = document.createElement("div");
    const ref = { current: div };
    renderHook(() => useFocusTrap(ref, false));

    act(() => {
      vi.runAllTimers();
    });

    expect(document.activeElement).not.toBe(div);
  });

  it("should focus the first focusable element on mount", () => {
    const div = document.createElement("div");
    const button = document.createElement("button");
    div.appendChild(button);
    document.body.appendChild(div);
    
    const ref = { current: div };
    renderHook(() => useFocusTrap(ref, true));

    act(() => {
      vi.runAllTimers();
    });

    expect(document.activeElement).toBe(button);
    document.body.removeChild(div);
  });

  it("should focus the container if no focusable elements exist", () => {
    const div = document.createElement("div");
    div.tabIndex = -1; // Make it focusable programmatically
    document.body.appendChild(div);
    
    const ref = { current: div };
    renderHook(() => useFocusTrap(ref, true));

    act(() => {
      vi.runAllTimers();
    });

    expect(document.activeElement).toBe(div);
    document.body.removeChild(div);
  });

  it("should trap focus with Tab key (forward)", () => {
    const div = document.createElement("div");
    const button1 = document.createElement("button");
    const button2 = document.createElement("button");
    div.appendChild(button1);
    div.appendChild(button2);
    document.body.appendChild(div);
    
    const ref = { current: div };
    renderHook(() => useFocusTrap(ref, true));

    act(() => { vi.runAllTimers(); });
    expect(document.activeElement).toBe(button1);

    // Focus last button to simulate tabbing
    button2.focus();
    expect(document.activeElement).toBe(button2);

    // Press Tab
    fireEvent.keyDown(div, { key: "Tab", code: "Tab" });

    // Should loop back to first button
    expect(document.activeElement).toBe(button1);
    
    document.body.removeChild(div);
  });

  it("should trap focus with Shift+Tab key (backward)", () => {
    const div = document.createElement("div");
    const button1 = document.createElement("button");
    const button2 = document.createElement("button");
    div.appendChild(button1);
    div.appendChild(button2);
    document.body.appendChild(div);
    
    const ref = { current: div };
    renderHook(() => useFocusTrap(ref, true));

    act(() => { vi.runAllTimers(); });
    expect(document.activeElement).toBe(button1);

    // Press Shift+Tab on first element
    fireEvent.keyDown(div, { key: "Tab", code: "Tab", shiftKey: true });

    // Should loop back to last button
    expect(document.activeElement).toBe(button2);
    
    document.body.removeChild(div);
  });

  it("should prevent default if no focusable elements and tab is pressed", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    
    const ref = { current: div };
    renderHook(() => useFocusTrap(ref, true));
    act(() => { vi.runAllTimers(); });

    const event = new KeyboardEvent("keydown", { key: "Tab", code: "Tab", cancelable: true });
    const dispatchResult = div.dispatchEvent(event);

    // dispatchEvent returns false if preventDefault() was called
    expect(dispatchResult).toBe(false);
    document.body.removeChild(div);
  });
});
