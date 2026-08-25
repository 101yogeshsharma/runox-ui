import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { useState } from "react";
import { Select } from "../Select";

/**
 * Type-level + runtime tests for the generic Select<TValue>.
 * The default `TValue = string` must preserve pre-generic behavior.
 */

describe("Select<TValue> generics", () => {
  it("works with default string generic (no explicit type args)", () => {
    function Harness() {
      const [value, setValue] = useState<string | undefined>("a");
      return (
        <Select value={value} onValueChange={setValue}>
          <Select.Trigger>
            <Select.Value placeholder="Pick" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="a">A</Select.Item>
            <Select.Item value="b">B</Select.Item>
          </Select.Content>
        </Select>
      );
    }
    const { container } = render(<Harness />);
    expect(container.querySelector(".rnx-select")).toBeTruthy();
  });

  it("accepts explicit string-literal-union generics", () => {
    type Size = "sm" | "md" | "lg";
    function Harness() {
      const [size, setSize] = useState<Size | undefined>("md");
      return (
        <Select<Size> value={size} onValueChange={setSize}>
          <Select.Trigger>
            <Select.Value placeholder="Size" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="sm">Small</Select.Item>
            <Select.Item value="md">Medium</Select.Item>
            <Select.Item value="lg">Large</Select.Item>
          </Select.Content>
        </Select>
      );
    }
    const { container } = render(<Harness />);
    expect(container.querySelector(".rnx-select")).toBeTruthy();
  });
});
