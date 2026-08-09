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
});
