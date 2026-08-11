"use client";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";

describe("Tabs", () => {
  it("renders with default value correctly", () => {
    const { getByText, getByRole } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(getByText("Content 1")).toBeVisible();
    expect(getByText("Content 2")).not.toBeVisible();
  });

  it("handles keyboard navigation (ArrowRight and ArrowLeft)", () => {
    const { getByRole, getAllByRole } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tabs = getAllByRole("tab");
    
    // Focus first tab
    tabs[0].focus();
    
    // Arrow right -> should activate tab 2
    fireEvent.keyDown(tabs[0], { key: "ArrowRight", code: "ArrowRight" });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");

    // Arrow right -> should activate tab 3
    fireEvent.keyDown(tabs[1], { key: "ArrowRight", code: "ArrowRight" });
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");

    // Arrow right -> should loop back to tab 1
    fireEvent.keyDown(tabs[2], { key: "ArrowRight", code: "ArrowRight" });
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    // Arrow left -> should loop back to tab 3
    fireEvent.keyDown(tabs[0], { key: "ArrowLeft", code: "ArrowLeft" });
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
  });

  it("ignores keyboard navigation if no tablist is found", () => {
    // This is an edge case test where TabsTrigger is used outside TabsList
    const { getByRole } = render(
      <Tabs defaultValue="tab1">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      </Tabs>
    );
    const tab = getByRole("tab");
    tab.focus();
    fireEvent.keyDown(tab, { key: "ArrowRight", code: "ArrowRight" });
    expect(tab).toHaveAttribute("aria-selected", "true"); // no error thrown
  });

  it("activates tab with Enter or Space key", () => {
    const { getAllByRole } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tabs = getAllByRole("tab");
    
    fireEvent.keyDown(tabs[1], { key: "Enter", code: "Enter" });
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(tabs[0], { key: " ", code: "Space" });
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  });

  it("does not activate disabled tabs with keyboard", () => {
    const { getAllByRole } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tabs = getAllByRole("tab");
    fireEvent.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");

    fireEvent.keyDown(tabs[1], { key: "Enter", code: "Enter" });
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
  });

  it("switches tabs on click", async () => {
    const { getByText } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    fireEvent.click(getByText("Tab 2"));

    await waitFor(() => {
      expect(getByText("Content 1")).not.toBeVisible();
      expect(getByText("Content 2")).toBeVisible();
    });
  });

  it("calls onValueChange when tab changes", () => {
    const onValueChange = vi.fn();
    const { getByText } = render(
      <Tabs defaultValue="tab1" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    fireEvent.click(getByText("Tab 2"));
    expect(onValueChange).toHaveBeenCalledWith("tab2");
  });
});
