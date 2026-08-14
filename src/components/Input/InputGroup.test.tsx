import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InputGroup } from "./InputGroup";
import { ThemeProvider } from "../ThemeProvider/ThemeProvider";

describe("InputGroup", () => {
  it("renders correctly", () => {
    render(
      <ThemeProvider>
        <InputGroup data-testid="input-group">
          <span>Test</span>
        </InputGroup>
      </ThemeProvider>,
    );
    const el = screen.getByTestId("input-group");
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("rnx-input-group");
    expect(el).toHaveClass("rounded-md"); // default radius
  });
});
