import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("renders a bounded value and formatted label", () => {
    render(
      <Progress
        value={25}
        max={50}
        showValue
        formatLabel={(value, max) => `${value}/${max}`}
      />,
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "25",
    );
    expect(screen.getByText("25/50")).toBeInTheDocument();
  });

  it("renders indeterminate and loading states", () => {
    render(<Progress value={20} variant="indeterminate" isLoading />);

    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
    expect(
      document.querySelector(".rnx-progress-indicator"),
    ).toBeInTheDocument();
  });

  it("uses a safe maximum and clamps percentages", () => {
    render(<Progress value={150} max={0} showValue />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuemax",
      "0",
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
