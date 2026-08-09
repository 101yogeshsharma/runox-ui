"use client";
import React from "react";
import { render } from "@testing-library/react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";

describe("Card", () => {
  it("renders all sections correctly", () => {
    const { getByText } = render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>
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
