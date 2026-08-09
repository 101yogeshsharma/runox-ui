import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Breadcrumb,
  BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./Breadcrumb";

describe("Breadcrumb Components", () => {
  it("renders the unified Breadcrumb component", () => {
    render(
      <Breadcrumb data-testid="breadcrumb">
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <span>Current</span>
      </Breadcrumb>
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
      <BreadcrumbRoot data-testid="root">
        <BreadcrumbList data-testid="list">
          <BreadcrumbItem data-testid="item-1">
            <BreadcrumbLink href="/" data-testid="link">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="sep" />
          <BreadcrumbItem data-testid="item-2">
            <BreadcrumbPage data-testid="page">Current Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </BreadcrumbRoot>
    );

    expect(screen.getByTestId("root")).toHaveAttribute(
      "aria-label",
      "breadcrumb"
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
