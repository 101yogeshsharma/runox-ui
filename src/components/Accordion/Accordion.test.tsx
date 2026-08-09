import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Accordion } from "./Accordion";

describe("Accordion Component", () => {
  it("renders the accordion items correctly", () => {
    render(
      <Accordion type="single" defaultValue="item-1">
        <Accordion.Item value="item-1" data-testid="item-1">
          <Accordion.Trigger data-testid="trigger-1">Item 1</Accordion.Trigger>
          <Accordion.Content data-testid="content-1">
            Content 1
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2" data-testid="item-2">
          <Accordion.Trigger data-testid="trigger-2">Item 2</Accordion.Trigger>
          <Accordion.Content data-testid="content-2">
            Content 2
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.getByTestId("trigger-1")).toBeInTheDocument();
    expect(screen.getByTestId("trigger-2")).toBeInTheDocument();

    // Check initial state
    expect(screen.getByTestId("trigger-1")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByTestId("trigger-2")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByTestId("content-1")).toHaveAttribute(
      "data-state",
      "open"
    );
    expect(screen.getByTestId("content-2")).toHaveAttribute(
      "data-state",
      "closed"
    );
  });

  it("handles single selection correctly", () => {
    render(
      <Accordion type="single" defaultValue="item-1">
        <Accordion.Item value="item-1">
          <Accordion.Trigger data-testid="trigger-1">Item 1</Accordion.Trigger>
          <Accordion.Content data-testid="content-1">
            Content 1
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger data-testid="trigger-2">Item 2</Accordion.Trigger>
          <Accordion.Content data-testid="content-2">
            Content 2
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    // Click item 2
    fireEvent.click(screen.getByTestId("trigger-2"));

    expect(screen.getByTestId("trigger-1")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByTestId("trigger-2")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("handles collapsible single selection", () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <Accordion.Item value="item-1">
          <Accordion.Trigger data-testid="trigger-1">Item 1</Accordion.Trigger>
          <Accordion.Content data-testid="content-1">
            Content 1
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    // Click to collapse
    fireEvent.click(screen.getByTestId("trigger-1"));
    expect(screen.getByTestId("trigger-1")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("handles multiple selection correctly", () => {
    render(
      <Accordion type="multiple" defaultValue={["item-1"]}>
        <Accordion.Item value="item-1">
          <Accordion.Trigger data-testid="trigger-1">Item 1</Accordion.Trigger>
          <Accordion.Content data-testid="content-1">
            Content 1
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="item-2">
          <Accordion.Trigger data-testid="trigger-2">Item 2</Accordion.Trigger>
          <Accordion.Content data-testid="content-2">
            Content 2
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    // Click item 2
    fireEvent.click(screen.getByTestId("trigger-2"));

    // Both should be open
    expect(screen.getByTestId("trigger-1")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByTestId("trigger-2")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });
});
