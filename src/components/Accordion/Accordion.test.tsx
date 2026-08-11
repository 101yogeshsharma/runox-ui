import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Accordion } from "./Accordion";
import { describe, it, expect } from "vitest";

describe("Accordion", () => {
  it("renders trigger and content", () => {
    const { getByText, getByRole } = render(
      <Accordion type="single" defaultValue="item-1">
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Item 1</Accordion.Trigger>
          <Accordion.Content>Content 1</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    expect(getByText("Item 1")).toBeInTheDocument();
    expect(getByText("Content 1")).toBeInTheDocument();
    expect(getByRole("button", { name: "Item 1" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("handles single selection", () => {
    const { getByRole, getByText } = render(
      <Accordion type="single">
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Item 1</Accordion.Trigger>
          <Accordion.Content>Content 1</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger>Item 2</Accordion.Trigger>
          <Accordion.Content>Content 2</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    fireEvent.click(getByRole("button", { name: "Item 1" }));
    expect(getByText("Content 1")).toBeVisible();

    fireEvent.click(getByRole("button", { name: "Item 2" }));
    expect(getByText("Content 2")).toBeVisible();
    expect(getByText("Content 1")).not.toBeVisible();
  });
  
  it("handles collapsible single selection", () => {
    const { getByRole, getByText } = render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Item 1</Accordion.Trigger>
          <Accordion.Content>Content 1</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    expect(getByText("Content 1")).toBeVisible();

    fireEvent.click(getByRole("button", { name: "Item 1" }));
    expect(getByText("Content 1")).not.toBeVisible();
  });

  it("handles multiple selection", () => {
    const { getByRole, getByText } = render(
      <Accordion type="multiple">
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Item 1</Accordion.Trigger>
          <Accordion.Content>Content 1</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger>Item 2</Accordion.Trigger>
          <Accordion.Content>Content 2</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    fireEvent.click(getByRole("button", { name: "Item 1" }));
    expect(getByText("Content 1")).toBeVisible();

    fireEvent.click(getByRole("button", { name: "Item 2" }));
    expect(getByText("Content 1")).toBeVisible();
    expect(getByText("Content 2")).toBeVisible();

    fireEvent.click(getByRole("button", { name: "Item 1" }));
    expect(getByText("Content 1")).not.toBeVisible();
    expect(getByText("Content 2")).toBeVisible();
  });

  it("handles keyboard navigation (ArrowDown and ArrowUp)", () => {
    const { getAllByRole } = render(
      <Accordion type="single">
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Item 1</Accordion.Trigger>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger>Item 2</Accordion.Trigger>
        </Accordion.Item>
        <Accordion.Item value="item-3">
          <Accordion.Trigger>Item 3</Accordion.Trigger>
        </Accordion.Item>
      </Accordion>
    );

    const triggers = getAllByRole("button");
    triggers[0].focus();

    // Arrow down -> should focus tab 2
    fireEvent.keyDown(triggers[0], { key: "ArrowDown", code: "ArrowDown" });
    expect(document.activeElement).toBe(triggers[1]);

    // Arrow down -> should focus tab 3
    fireEvent.keyDown(triggers[1], { key: "ArrowDown", code: "ArrowDown" });
    expect(document.activeElement).toBe(triggers[2]);

    // Arrow down -> should loop to tab 1
    fireEvent.keyDown(triggers[2], { key: "ArrowDown", code: "ArrowDown" });
    expect(document.activeElement).toBe(triggers[0]);

    // Arrow up -> should loop to tab 3
    fireEvent.keyDown(triggers[0], { key: "ArrowUp", code: "ArrowUp" });
    expect(document.activeElement).toBe(triggers[2]);
  });
  


  it("toggles aria-expanded attribute", () => {
    const { getByRole } = render(
      <Accordion type="single" collapsible>
        <Accordion.Item value="item-1">
          <Accordion.Trigger>Item 1</Accordion.Trigger>
          <Accordion.Content>Content 1</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = getByRole("button", { name: "Item 1" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
