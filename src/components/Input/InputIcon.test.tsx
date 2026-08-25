import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InputIcon } from "./InputIcon";

describe("InputIcon", () => {
  it("renders correctly with position left", () => {
    render(
      <InputIcon position="left" data-testid="input-icon">
        <svg />
      </InputIcon>,
    );
    const el = screen.getByTestId("input-icon");
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("rnx-input-icon");
    expect(el).toHaveClass("rnx-input-icon--position-left");
  });

  it("renders correctly with position right", () => {
    render(
      <InputIcon position="right" data-testid="input-icon-right">
        <svg />
      </InputIcon>,
    );
    const el = screen.getByTestId("input-icon-right");
    expect(el).toHaveClass("rnx-input-icon--position-right");
  });
});
