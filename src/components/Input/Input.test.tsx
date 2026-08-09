"use client";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Input } from "./Input";
import { vi, describe, it, expect } from "vitest";

describe("Input", () => {
  it("renders correctly", () => {
    const { getByRole } = render(<Input placeholder="Enter text" />);
    expect(getByRole("textbox")).toBeInTheDocument();
  });

  it("renders label and links it to input", () => {
    const { getByLabelText } = render(<Input label="Username" />);
    expect(getByLabelText("Username")).toBeInTheDocument();
  });

  it("renders error message", () => {
    const { getByText, getByRole } = render(<Input error="Invalid input" />);
    expect(getByText("Invalid input")).toBeInTheDocument();
    expect(getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("handles value changes", () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Input onChange={onChange} />);
    const input = getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalled();
  });
});
