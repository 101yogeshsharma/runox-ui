"use client";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Dropdown } from "./Dropdown";

describe("Dropdown", () => {
  it("renders trigger but not menu initially", () => {
    const { getByText, queryByText } = render(
      <Dropdown>
        <Dropdown.Trigger>Open</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
    );
    expect(getByText("Open")).toBeInTheDocument();
    expect(queryByText("Item 1")).toBeNull();
  });

  it("opens menu when trigger is clicked", async () => {
    const { getByText } = render(
      <Dropdown>
        <Dropdown.Trigger>Open</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
    );
    fireEvent.click(getByText("Open"));

    await waitFor(() => {
      expect(getByText("Item 1")).toBeInTheDocument();
    });
  });

  it("closes when an item is clicked", async () => {
    const { getByText, queryByText } = render(
      <Dropdown>
        <Dropdown.Trigger>Open</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
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
        <Dropdown
          multiple
          value={val}
          onValueChange={(v) => setVal(v as string[])}
        >
          <Dropdown.Trigger placeholder="Select items" />
          <Dropdown.Content>
            <Dropdown.Item value="item1">Item 1</Dropdown.Item>
            <Dropdown.Item value="item2">Item 2</Dropdown.Item>
            <Dropdown.Item value="item3">Item 3</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      );
    };

    const { getByText, queryByText, container } = render(<TestComponent />);

    // Initial tags rendered in trigger
    expect(getByText("item1")).toBeInTheDocument();
    expect(getByText("item2")).toBeInTheDocument();

    const removeBtns = container.querySelectorAll(
      ".rnx-dropdown-badge-remove-btn",
    );
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
        <Dropdown.Trigger>Open</Dropdown.Trigger>
        <Dropdown.Content searchable searchPlaceholder="Search test">
          <Dropdown.Search placeholder="Custom search" />
          <Dropdown.Empty>No results</Dropdown.Empty>
          <Dropdown.Group heading="Group 1">
            <Dropdown.Item>Item 1</Dropdown.Item>
          </Dropdown.Group>
          <Dropdown.Divider />
        </Dropdown.Content>
      </Dropdown>,
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
        <Dropdown.Trigger>Open</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item value="item1">Item 1</Dropdown.Item>
          <Dropdown.Item value="item2">Item 2</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
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
        <Dropdown.Trigger>Open</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item onSelect={onSelect}>Non Selectable</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
    );

    fireEvent.click(getByText("Open"));
    await waitFor(() =>
      expect(getByText("Non Selectable")).toBeInTheDocument(),
    );

    fireEvent.click(getByText("Non Selectable"));
    expect(onSelect).toHaveBeenCalled();

    // Menu should close
    await waitFor(() => expect(queryByText("Non Selectable")).toBeNull());
  });

  it("only adds pl-8 indicator padding to items with values", async () => {
    const { getByText, getByRole } = render(
      <Dropdown defaultValue="opt1">
        <Dropdown.Trigger />
        <Dropdown.Content>
          <Dropdown.Item value="opt1">Selectable Option</Dropdown.Item>
          <Dropdown.Item>Action Without Value</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
    );

    fireEvent.click(getByRole("button"));
    await waitFor(() => {
      expect(getByText("Selectable Option")).toBeInTheDocument();
      expect(getByText("Action Without Value")).toBeInTheDocument();
    });

    const selectable = getByText("Selectable Option");
    const action = getByText("Action Without Value");

    expect(selectable.className).toContain("pl-8");
    expect(action.className).not.toContain("pl-8");
  });

  it("toggles off selection when an already-selected single-select item is clicked", async () => {
    const onValueChange = vi.fn();
    const { getByText, getByRole } = render(
      <Dropdown value="item1" onValueChange={onValueChange}>
        <Dropdown.Trigger />
        <Dropdown.Content>
          <Dropdown.Item value="item1">Item 1</Dropdown.Item>
          <Dropdown.Item value="item2">Item 2</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
    );

    fireEvent.click(getByRole("button"));
    await waitFor(() => expect(getByText("Item 1")).toBeInTheDocument());

    // Clicking already-selected item1 should deselect (emit "")
    fireEvent.click(getByText("Item 1"));
    expect(onValueChange).toHaveBeenCalledWith("");
  });
});
