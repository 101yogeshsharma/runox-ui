"use client";
import React from "react";
import { render } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders default badge", () => {
    const { getByText } = render(<Badge>Default</Badge>);
    const badge = getByText("Default");
    expect(badge).toHaveClass("rnx-badge--subtle-primary");
  });

  it("renders with custom color and variant", () => {
    const { getByText } = render(
      <Badge color="success" variant="subtle">
        Success
      </Badge>
    );
    const badge = getByText("Success");
    expect(badge).toHaveClass("rnx-badge--subtle-success");
  });
});
