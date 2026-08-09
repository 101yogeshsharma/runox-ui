"use client";
import { Box } from "../../atoms/Box";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal";
import { vi } from "vitest";

import { MakeWayProvider } from "../Motion";

describe("Modal", () => {
  it("does not render when isOpen is false", () => {
    const { queryByRole } = render(
      <MakeWayProvider>
        <Modal isOpen={false} onClose={vi.fn()}>
          <Box>Modal Content</Box>
        </Modal>
      </MakeWayProvider>
    );
    expect(queryByRole("dialog")).toBeNull();
  });

  it("renders correctly when isOpen is true", () => {
    const { getByRole, getByText } = render(
      <MakeWayProvider>
        <Modal isOpen={true} onClose={vi.fn()}>
          <ModalHeader>Header</ModalHeader>
          <ModalBody>Body</ModalBody>
          <ModalFooter>Footer</ModalFooter>
        </Modal>
      </MakeWayProvider>
    );
    expect(getByRole("dialog")).toBeInTheDocument();
    expect(getByText("Header")).toBeInTheDocument();
    expect(getByText("Body")).toBeInTheDocument();
    expect(getByText("Footer")).toBeInTheDocument();
  });

  it("calls onClose when overlay is clicked", async () => {
    const onClose = vi.fn();
    const { getByRole } = render(
      <MakeWayProvider>
        <Modal isOpen={true} onClose={onClose}>
          <Box>Content</Box>
        </Modal>
      </MakeWayProvider>
    );
    fireEvent.mouseDown(getByRole("dialog"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(
      <MakeWayProvider>
        <Modal isOpen={true} onClose={onClose}>
          <Box>Content</Box>
        </Modal>
      </MakeWayProvider>
    );
    fireEvent.click(getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
});
