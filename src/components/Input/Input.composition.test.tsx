import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input composition", () => {
  it("renders a controlled input with a working clear button", () => {
    const onClear = vi.fn();
    const Controlled = () => {
      const [value, setValue] = React.useState("typed");
      return (
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          clearable
          onClear={onClear}
        />
      );
    };

    render(<Controlled />);
    expect(screen.getByRole("textbox")).toHaveValue("typed");

    fireEvent.click(screen.getByRole("button", { name: "Clear input" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("renders prefix and suffix adornments", () => {
    render(<Input prefix="$" suffix="USD" />);

    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("hides the clear button while disabled", () => {
    render(<Input defaultValue="locked" clearable disabled />);

    expect(
      screen.queryByRole("button", { name: "Clear input" }),
    ).not.toBeInTheDocument();
  });
});
