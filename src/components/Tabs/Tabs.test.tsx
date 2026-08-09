"use client";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";

describe("Tabs", () => {
  it("renders default tab content", () => {
    const { getByText, queryByText } = render(
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

  it("switches tabs on click", async () => {
    const { getByText, queryByText } = render(
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
