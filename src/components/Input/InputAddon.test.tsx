import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InputAddon } from "./InputAddon";

describe("InputAddon", () => {
  it("renders correctly with position before", () => {
    render(
      <InputAddon position="before" data-testid="input-addon">
        <span>Prefix</span>
      </InputAddon>,
    );
    const el = screen.getByTestId("input-addon");
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("rnx-input-addon");
    expect(el).toHaveClass("rnx-input-addon--position-before");
  });

  it("renders correctly with position after", () => {
    render(
      <InputAddon position="after" data-testid="input-addon-after">
        <span>Suffix</span>
      </InputAddon>,
    );
    const el = screen.getByTestId("input-addon-after");
    expect(el).toHaveClass("rnx-input-addon--position-after");
  });
});
