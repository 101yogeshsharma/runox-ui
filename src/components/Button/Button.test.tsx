"use client";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Button } from "./Button";
import { vi } from "vitest";
import { axe } from "jest-axe";

describe("Button", () => {
  it("should not have basic accessibility violations", async () => {
    const { container } = render(<Button>Accessible</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  it("renders correctly", () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole("button")).toHaveTextContent("Click me");
  });

  it("handles click events", () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire click when disabled", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>
    );
    fireEvent.click(getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders loading spinner and disables button when isLoading is true", () => {
    const { container, getByRole } = render(<Button isLoading>Loading</Button>);
    expect(getByRole("button")).toBeDisabled();
    expect(container.querySelector(".rnx-button__spinner")).toBeInTheDocument();
  });

  it("renders as a link when href is provided", () => {
    const { getByRole } = render(
      <Button href="https://example.com">Link</Button>
    );
    const link = getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("handles anchors disabled state", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button href="https://example.com" disabled onClick={onClick}>Link</Button>
    );
    const link = getByRole("link");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies variants, sizes, colors and fullWidth", () => {
    const { getByRole } = render(
      <Button variant="outline" color="danger" size="lg" fullWidth>
        Styled
      </Button>
    );
    const btn = getByRole("button");
    expect(btn).toHaveClass("rnx-button--outline-danger");
    expect(btn).toHaveClass("rnx-button--size-lg");
    expect(btn).toHaveClass("rnx-button--full-width");
  });

  it("applies fab and icon sizing correctly", () => {
    const { getByRole, rerender } = render(<Button variant="icon">Icon</Button>);
    expect(getByRole("button")).toHaveClass("rnx-button--size-icon");

    rerender(<Button variant="fab">Fab</Button>);
    expect(getByRole("button")).toHaveClass("rnx-button--size-fab");
    expect(getByRole("button")).toHaveClass("rnx-button--variant-fab");
  });

  it("renders left and right icons", () => {
    const { getByText } = render(
      <Button leftIcon={<span>Left</span>} rightIcon={<span>Right</span>}>
        Middle
      </Button>
    );
    expect(getByText("Left")).toBeInTheDocument();
    expect(getByText("Right")).toBeInTheDocument();
  });

  it("handles isMagnetic mouse events without crashing", () => {
    // Testing specific transform values is hard without real DOM layout,
    // but we can ensure the event listeners don't throw.
    const { getByRole } = render(<Button isMagnetic>Magnetic</Button>);
    const btn = getByRole("button");
    
    // Simulate mouse enter/move
    fireEvent.mouseMove(btn, { clientX: 100, clientY: 100 });
    // Simulate mouse leave
    fireEvent.mouseLeave(btn);
  });
});
