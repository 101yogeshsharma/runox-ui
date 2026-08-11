import { renderHook, act } from "@testing-library/react";
import { useClipboard } from "./useClipboard";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock navigator.clipboard
const writeTextMock = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: writeTextMock,
  },
});

describe("useClipboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    writeTextMock.mockReset();
    writeTextMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with hasCopied as false", () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.hasCopied).toBe(false);
    expect(result.current.value).toBe(false);
  });

  it("should copy text and set hasCopied to true", async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      result.current.onCopy("test text");
    });

    expect(writeTextMock).toHaveBeenCalledWith("test text");
    expect(result.current.hasCopied).toBe(true);
  });

  it("should revert hasCopied to false after timeout", async () => {
    const { result } = renderHook(() => useClipboard({ timeout: 1000 }));

    await act(async () => {
      result.current.onCopy("test text");
    });

    expect(result.current.hasCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.hasCopied).toBe(false);
  });

  it("should not copy if text is empty", async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      result.current.onCopy("");
    });

    expect(writeTextMock).not.toHaveBeenCalled();
    expect(result.current.hasCopied).toBe(false);
  });
});
