import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AlertDialog } from "./AlertDialog";

describe("AlertDialog Component", () => {
  it("renders trigger and opens dialog on click", async () => {
    render(
      <AlertDialog>
        <AlertDialog.Trigger data-testid="trigger">
          Open Dialog
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay data-testid="overlay" />
          <AlertDialog.Content data-testid="content">
            <AlertDialog.Header>
              <AlertDialog.Title>Title</AlertDialog.Title>
              <AlertDialog.Description>Description</AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Cancel data-testid="cancel">
                Cancel
              </AlertDialog.Cancel>
              <AlertDialog.Action data-testid="action">
                Action
              </AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    );

    const trigger = screen.getByTestId("trigger");
    expect(trigger).toBeInTheDocument();

    // Dialog should not be open yet
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();

    // Open dialog
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();

    // Close dialog
    const cancel = screen.getByTestId("cancel");
    fireEvent.click(cancel);

    await waitFor(() => {
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });
  });
});
