import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Breadcrumb } from "./Breadcrumb";

describe("Breadcrumb Components", () => {
  it("renders the unified Breadcrumb component", () => {
    render(
      <Breadcrumb data-testid="breadcrumb">
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <span>Current</span>
      </Breadcrumb>,
    );

    const breadcrumb = screen.getByTestId("breadcrumb");
    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb.tagName).toBe("NAV");

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("renders individual Breadcrumb parts", () => {
    render(
      <Breadcrumb.Root data-testid="root">
        <Breadcrumb.List data-testid="list">
          <Breadcrumb.Item data-testid="item-1">
            <Breadcrumb.Link href="/" data-testid="link">
              Home
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator data-testid="sep" />
          <Breadcrumb.Item data-testid="item-2">
            <Breadcrumb.Page data-testid="page">Current Page</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>,
    );

    expect(screen.getByTestId("root")).toHaveAttribute(
      "aria-label",
      "breadcrumb",
    );
    expect(screen.getByTestId("list").tagName).toBe("OL");
    expect(screen.getByTestId("item-1").tagName).toBe("LI");
    expect(screen.getByTestId("sep").tagName).toBe("LI");
    expect(screen.getByTestId("sep")).toHaveAttribute("aria-hidden", "true");

    const link = screen.getByTestId("link");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/");

    const page = screen.getByTestId("page");
    expect(page.tagName).toBe("SPAN");
    expect(page).toHaveAttribute("aria-current", "page");
  });
});
