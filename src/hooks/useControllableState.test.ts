import { renderHook, act } from "@testing-library/react";
import { useControllableState } from "./useControllableState";
import { vi, describe, it, expect } from "vitest";

describe("useControllableState", () => {
  describe("uncontrolled mode", () => {
    it("should use defaultProp", () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultProp: "default" })
      );
      expect(result.current[0]).toBe("default");
    });

    it("should update uncontrolled state with exact value", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultProp: "default", onChange })
      );

      act(() => {
        result.current[1]("new");
      });

      expect(result.current[0]).toBe("new");
      expect(onChange).toHaveBeenCalledWith("new");
    });

    it("should update uncontrolled state with functional update", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultProp: "default", onChange })
      );

      act(() => {
        result.current[1]((prev) => `${prev}-new`);
      });

      expect(result.current[0]).toBe("default-new");
      expect(onChange).toHaveBeenCalledWith("default-new");
    });
    
    it("should handle chained functional updates properly", () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultProp: 1 })
      );

      act(() => {
        result.current[1]((prev) => (prev as number) + 1);
        result.current[1]((prev) => (prev as number) + 1);
      });

      expect(result.current[0]).toBe(3);
    });
  });

  describe("controlled mode", () => {
    it("should use prop over defaultProp", () => {
      const { result } = renderHook(() =>
        useControllableState({ prop: "controlled", defaultProp: "default" })
      );
      expect(result.current[0]).toBe("controlled");
    });

    it("should not update state internally when controlled, but call onChange with exact value", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ prop: "controlled", onChange })
      );

      act(() => {
        result.current[1]("new");
      });

      // Internal state shouldn't change
      expect(result.current[0]).toBe("controlled");
      expect(onChange).toHaveBeenCalledWith("new");
    });
    
    it("should not call onChange if new value is same as prop", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ prop: "controlled", onChange })
      );

      act(() => {
        result.current[1]("controlled");
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("should call onChange with functional update result", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ prop: "controlled", onChange })
      );

      act(() => {
        result.current[1]((prev) => `${prev}-new`);
      });

      expect(result.current[0]).toBe("controlled");
      expect(onChange).toHaveBeenCalledWith("controlled-new");
    });
  });

  describe("useCallbackRef", () => {
    it("should use the latest callback", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      const { result, rerender } = renderHook(
        ({ cb }) => useControllableState({ onChange: cb }),
        { initialProps: { cb: callback1 } }
      );

      act(() => {
        result.current[1]("new");
      });
      expect(callback1).toHaveBeenCalledWith("new");
      expect(callback2).not.toHaveBeenCalled();

      rerender({ cb: callback2 });

      act(() => {
        result.current[1]("newer");
      });
      expect(callback2).toHaveBeenCalledWith("newer");
    });
  });
});
