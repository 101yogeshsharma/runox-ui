import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BentoGrid, BentoGridItem } from "./BentoGrid";

describe("BentoGrid Components", () => {
  it("renders BentoGrid with children", () => {
    render(
      <BentoGrid data-testid="bento-grid">
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </BentoGrid>
    );

    const grid = screen.getByTestId("bento-grid");
    expect(grid).toBeInTheDocument();
    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("renders BentoGridItem with all props", () => {
    render(
      <BentoGridItem
        title="Title"
        description="Description"
        header={<div data-testid="header">Header</div>}
        icon={<div data-testid="icon">Icon</div>}
      />
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
