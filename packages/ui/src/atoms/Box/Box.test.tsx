import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Box } from "./Box";

describe("Box Component", () => {
  it("renders a div by default", () => {
    render(<Box data-testid="box">Content</Box>);
    const box = screen.getByTestId("box");
    expect(box.tagName).toBe("DIV");
    expect(box).toHaveClass("rnx-box");
    expect(box).toHaveTextContent("Content");
  });

  it("renders as a different element using the 'as' prop", () => {
    render(
      <Box as="span" data-testid="box-span">
        Span Content
      </Box>
    );
    const box = screen.getByTestId("box-span");
    expect(box.tagName).toBe("SPAN");
    expect(box).toHaveTextContent("Span Content");
  });

  it("applies custom className", () => {
    render(
      <Box data-testid="box" className="custom-class">
        Content
      </Box>
    );
    const box = screen.getByTestId("box");
    expect(box).toHaveClass("rnx-box");
    expect(box).toHaveClass("custom-class");
  });

  it("forwards refs correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Box ref={ref} data-testid="box" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("box"));
  });

  it("forwards additional props", () => {
    render(
      <Box data-testid="box" id="test-id" aria-label="test-aria">
        Content
      </Box>
    );
    const box = screen.getByTestId("box");
    expect(box).toHaveAttribute("id", "test-id");
    expect(box).toHaveAttribute("aria-label", "test-aria");
  });
});
