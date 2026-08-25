"use client";
import { Box } from "../../atoms/Box";
import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { Modal } from "./Modal";
import { afterEach, vi } from "vitest";

describe("Modal", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render when isOpen is false", () => {
    const { queryByRole } = render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <Box>Modal Content</Box>
      </Modal>,
    );
    expect(queryByRole("dialog")).toBeNull();
  });

  it("renders correctly when isOpen is true", () => {
    const { getByRole, getByText } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <Modal.Header>Header</Modal.Header>
        <Modal.Body>Body</Modal.Body>
        <Modal.Footer>Footer</Modal.Footer>
      </Modal>,
    );
    expect(getByRole("dialog")).toBeInTheDocument();
    expect(getByText("Header")).toBeInTheDocument();
    expect(getByText("Body")).toBeInTheDocument();
    expect(getByText("Footer")).toBeInTheDocument();
  });

  it("calls onClose when overlay is clicked", async () => {
    const onClose = vi.fn();
    const { getByRole } = render(
      <Modal isOpen={true} onClose={onClose}>
        <Box>Content</Box>
      </Modal>,
    );
    fireEvent.mouseDown(getByRole("dialog"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(
      <Modal isOpen={true} onClose={onClose}>
        <Box>Content</Box>
      </Modal>,
    );
    fireEvent.click(getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("focuses modal content after the portal mounts and restores focus", () => {
    vi.useFakeTimers();
    const trigger = document.createElement("button");
    trigger.textContent = "Open modal";
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <Modal.Body>Body</Modal.Body>
      </Modal>,
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByLabelText("Close")).toHaveFocus();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
