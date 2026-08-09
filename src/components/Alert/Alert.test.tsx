import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Alert } from "./Alert";

describe("Alert Component", () => {
  it("renders the alert content", () => {
    render(<Alert data-testid="alert">Alert Content</Alert>);
    const alert = screen.getByTestId("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Alert Content");
  });

  it("renders a title when provided", () => {
    render(<Alert title="Alert Title">Content</Alert>);
    expect(screen.getByText("Alert Title")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const handleClose = vi.fn();
    render(<Alert onClose={handleClose}>Content</Alert>);

    const closeBtn = screen.getByRole("button", { name: "Close alert" });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders with a specific variant", () => {
    render(
      <Alert variant="danger" data-testid="alert">
        Error
      </Alert>
    );
    const alert = screen.getByTestId("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });
});
