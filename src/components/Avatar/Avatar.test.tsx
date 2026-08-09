"use client";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders image when src is provided", () => {
    const { getByRole } = render(
      <Avatar src="https://example.com/img.jpg" alt="Test User" />
    );
    const img = getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
    expect(img).toHaveAttribute("alt", "Test User");
  });

  it("renders fallback when src is missing", () => {
    const { getByText, queryByRole } = render(<Avatar alt="John Doe" />);
    expect(queryByRole("img")).toBeNull();
    // Default fallback is first letter of alt text
    expect(getByText("J")).toBeInTheDocument();
  });

  it("renders custom fallback", () => {
    const { getByText } = render(<Avatar fallback="XD" />);
    expect(getByText("XD")).toBeInTheDocument();
  });

  it("falls back to text when image fails to load", () => {
    const { getByRole, getByText } = render(
      <Avatar src="bad-url.jpg" alt="Bob" />
    );
    const img = getByRole("img");
    fireEvent.error(img);
    // After error, image should disappear and fallback should show
    expect(getByText("B")).toBeInTheDocument();
  });
});
