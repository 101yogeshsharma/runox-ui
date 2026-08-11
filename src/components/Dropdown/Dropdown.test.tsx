"use client";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Dropdown, DropdownItem, DropdownTrigger, DropdownContent, DropdownSearch, DropdownEmpty, DropdownGroup, DropdownDivider } from "./Dropdown";

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

  it("closes when an item is clicked", async () => {
    const { getByText, queryByText } = render(
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

    const item = getByText("Item 1");
    fireEvent.click(item);

    await waitFor(() => {
      expect(queryByText("Item 1")).toBeNull();
    });
  });



  it("handles multiple selection and removal", async () => {
    const TestComponent = () => {
      const [val, setVal] = React.useState<string[]>(["item1", "item2"]);
      return (
        <Dropdown multiple value={val} onValueChange={(v) => setVal(v as string[])}>
          <DropdownTrigger placeholder="Select items" />
          <DropdownContent>
            <DropdownItem value="item1">Item 1</DropdownItem>
            <DropdownItem value="item2">Item 2</DropdownItem>
            <DropdownItem value="item3">Item 3</DropdownItem>
          </DropdownContent>
        </Dropdown>
      );
    };

    const { getByText, queryByText, container } = render(<TestComponent />);

    // Initial tags rendered in trigger
    expect(getByText("item1")).toBeInTheDocument();
    expect(getByText("item2")).toBeInTheDocument();

    const removeBtns = container.querySelectorAll(".rnx-dropdown-badge-remove-btn");
    expect(removeBtns.length).toBe(2);

    // Click remove button for item1
    fireEvent.click(removeBtns[0]);
    await waitFor(() => {
      expect(queryByText("item1")).toBeNull();
    });

    // Enter key to remove item2
    fireEvent.keyDown(removeBtns[1], { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(queryByText("item2")).toBeNull();
    });

    // Shows placeholder when empty
    expect(getByText("Select items")).toBeInTheDocument();
  });

  it("renders auxiliary components correctly", async () => {
    const { getByText, getByPlaceholderText } = render(
      <Dropdown>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownContent searchable searchPlaceholder="Search test">
          <DropdownSearch placeholder="Custom search" />
          <DropdownEmpty>No results</DropdownEmpty>
          <DropdownGroup heading="Group 1">
            <DropdownItem>Item 1</DropdownItem>
          </DropdownGroup>
          <DropdownDivider />
        </DropdownContent>
      </Dropdown>
    );

    fireEvent.click(getByText("Open"));
    
    await waitFor(() => {
      expect(getByPlaceholderText("Custom search")).toBeInTheDocument();
      expect(getByText("Group 1")).toBeInTheDocument();
    });
  });

  it("handles selecting in multiple mode", async () => {
    const { getByText, queryByText } = render(
      <Dropdown multiple>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownContent>
          <DropdownItem value="item1">Item 1</DropdownItem>
          <DropdownItem value="item2">Item 2</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );

    fireEvent.click(getByText("Open"));
    await waitFor(() => expect(getByText("Item 1")).toBeInTheDocument());

    // Select Item 1
    fireEvent.click(getByText("Item 1"));
    await waitFor(() => expect(getByText("item1")).toBeInTheDocument()); // Badge renders

    // Trigger should stay open in multiple mode
    expect(getByText("Item 2")).toBeInTheDocument();

    // Deselect Item 1
    fireEvent.click(getByText("Item 1"));
    await waitFor(() => expect(queryByText("item1")).toBeNull());
  });

  it("handles itemSelect on non-selectable item", async () => {
    const onSelect = vi.fn();
    const { getByText, queryByText } = render(
      <Dropdown>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownContent>
          <DropdownItem onSelect={onSelect}>Non Selectable</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );

    fireEvent.click(getByText("Open"));
    await waitFor(() => expect(getByText("Non Selectable")).toBeInTheDocument());

    fireEvent.click(getByText("Non Selectable"));
    expect(onSelect).toHaveBeenCalled();

    // Menu should close
    await waitFor(() => expect(queryByText("Non Selectable")).toBeNull());
  });
});
