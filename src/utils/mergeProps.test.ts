import { mergeProps } from "./mergeProps";
import { describe, it, expect, vi } from "vitest";

describe("mergeProps", () => {
  it("should merge basic properties, preferring consumer props", () => {
    const internal = { a: 1, b: 2 };
    const consumer = { b: 3, c: 4 };
    expect(mergeProps(internal, consumer)).toEqual({ a: 1, b: 3, c: 4 });
  });

  it("should chain event handlers (on*)", () => {
    const internalClick = vi.fn();
    const consumerClick = vi.fn();
    
    const internal = { onClick: internalClick };
    const consumer = { onClick: consumerClick };
    
    const merged = mergeProps(internal, consumer);
    
    merged.onClick("test");
    
    expect(internalClick).toHaveBeenCalledWith("test");
    expect(consumerClick).toHaveBeenCalledWith("test");
  });

  it("should override non-event functions", () => {
    const internalFn = vi.fn();
    const consumerFn = vi.fn();
    
    const internal = { renderItem: internalFn };
    const consumer = { renderItem: consumerFn };
    
    const merged = mergeProps(internal, consumer);
    
    merged.renderItem("test");
    
    expect(internalFn).not.toHaveBeenCalled();
    expect(consumerFn).toHaveBeenCalledWith("test");
  });

  it("should merge className using cn()", () => {
    const internal = { className: "text-red-500 p-4" };
    const consumer = { className: "p-8 bg-blue-500" };
    
    const merged = mergeProps(internal, consumer);
    // Since cn simply joins right now (or dedupes if tailwind-merge was used), 
    // it should contain both sets of classes depending on cn's logic.
    expect(merged.className).toBe("text-red-500 p-4 p-8 bg-blue-500");
  });

  it("should merge style objects", () => {
    const internal = { style: { color: "red", padding: "10px" } };
    const consumer = { style: { padding: "20px", margin: "5px" } };
    
    const merged = mergeProps(internal, consumer);
    expect(merged.style).toEqual({ color: "red", padding: "20px", margin: "5px" });
  });

  it("should merge aria-labelledby and aria-describedby", () => {
    const internal = { "aria-labelledby": "id1", "aria-describedby": "desc1" };
    const consumer = { "aria-labelledby": "id2", "aria-describedby": "desc2" };
    
    const merged = mergeProps(internal, consumer);
    expect(merged["aria-labelledby"]).toBe("id1 id2");
    expect(merged["aria-describedby"]).toBe("desc1 desc2");
  });

  it("should handle missing aria attributes", () => {
    const internal = { "aria-labelledby": "id1" };
    const consumer = {};
    
    const merged = mergeProps(internal, consumer);
    expect(merged["aria-labelledby"]).toBe("id1");
  });

  it("should fall back to internal if consumer prop is explicitly undefined", () => {
    const internal = { title: "default" };
    const consumer = { title: undefined };
    
    const merged = mergeProps(internal, consumer);
    expect(merged.title).toBe("default");
  });
});
