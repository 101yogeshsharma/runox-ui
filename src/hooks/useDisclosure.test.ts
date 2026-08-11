import { renderHook, act } from "@testing-library/react";
import { useDisclosure } from "./useDisclosure";
import { vi, describe, it, expect } from "vitest";

describe("useDisclosure", () => {
  it("should initialize with defaultIsOpen false by default", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it("should initialize with defaultIsOpen true when passed", () => {
    const { result } = renderHook(() => useDisclosure({ defaultIsOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  it("should open the disclosure", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("should close the disclosure", () => {
    const { result } = renderHook(() => useDisclosure({ defaultIsOpen: true }));
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should toggle the disclosure state", () => {
    const { result } = renderHook(() => useDisclosure());
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should call onOpen and onClose callbacks", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() => useDisclosure({ onOpen, onClose }));

    act(() => {
      result.current.open();
    });
    expect(onOpen).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.close();
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.toggle();
    });
    expect(onOpen).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.toggle();
    });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
