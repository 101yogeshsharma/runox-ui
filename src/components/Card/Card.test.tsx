"use client";
import React from "react";
import { render } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders all sections correctly", () => {
    const { getByText } = render(
      <Card>
        <Card.Header>Header</Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );

    expect(getByText("Header")).toBeInTheDocument();
    expect(getByText("Body")).toBeInTheDocument();
    expect(getByText("Footer")).toBeInTheDocument();
  });

  it("applies glassmorphism classes", () => {
    const { container } = render(<Card variant="glass">Glass</Card>);
    expect(container.firstChild).toHaveClass("rnx-card--variant-glass");
  });

  it("applies interactive classes", () => {
    const { container } = render(<Card isInteractive>Interactive</Card>);
    expect(container.firstChild).toHaveClass("rnx-card--interactive");
  });
});
