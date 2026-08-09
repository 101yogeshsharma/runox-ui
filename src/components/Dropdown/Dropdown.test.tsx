"use client";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Dropdown, DropdownItem, DropdownTrigger, DropdownContent } from "./Dropdown";

describe("Dropdown", () => {
  it("renders trigger but not menu initially", () => {
    const { getByText, queryByText } = render(
      <Dropdown>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    expect(getByText("Open")).toBeInTheDocument();
    expect(queryByText("Item 1")).toBeNull();
  });

  it("opens menu when trigger is clicked", async () => {
    const { getByText } = render(
      <Dropdown>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
    fireEvent.click(getByText("Open"));
    await waitFor(() => {
      expect(getByText("Item 1")).toBeInTheDocument();
    });
  });
});
