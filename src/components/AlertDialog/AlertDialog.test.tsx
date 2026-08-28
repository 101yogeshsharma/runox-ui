import { render, fireEvent, act } from "@testing-library/react";
import { AlertDialog } from "./AlertDialog";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("AlertDialog", () => {
  const TestComponent = ({
    onOpenChange,
    dismissible,
  }: {
    onOpenChange?: (open: boolean) => void;
    dismissible?: boolean;
  }) => (
    <AlertDialog onOpenChange={onOpenChange} dismissible={dismissible}>
      <AlertDialog.Trigger asChild>
        <button data-testid="trigger">Open</button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content data-testid="content">
          <AlertDialog.Header>
            <AlertDialog.Title>Title</AlertDialog.Title>
            <AlertDialog.Description>Description</AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel asChild>
              <button data-testid="cancel">Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button data-testid="action">Action</button>
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders trigger and does not render content initially", () => {
    const { queryByTestId } = render(<TestComponent />);
    expect(queryByTestId("trigger")).toBeInTheDocument();
    expect(queryByTestId("content")).not.toBeInTheDocument();
  });

  it("opens content on trigger click", () => {
    const onOpenChange = vi.fn();
    const { getByTestId } = render(
      <TestComponent onOpenChange={onOpenChange} />,
    );

    fireEvent.click(getByTestId("trigger"));

    act(() => {
      vi.runAllTimers();
    });

    expect(getByTestId("content")).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("closes on cancel click", () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />);

    fireEvent.click(getByTestId("trigger"));

    act(() => {
      vi.runAllTimers();
    });

    fireEvent.click(getByTestId("cancel"));

    act(() => {
      vi.runAllTimers();
    });

    expect(queryByTestId("content")).not.toBeInTheDocument();
  });

  it("closes on action click", () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />);

    fireEvent.click(getByTestId("trigger"));

    act(() => {
      vi.runAllTimers();
    });

    fireEvent.click(getByTestId("action"));

    act(() => {
      vi.runAllTimers();
    });

    expect(queryByTestId("content")).not.toBeInTheDocument();
  });

  it("does not close on Escape by default (WAI-ARIA alertdialog pattern)", () => {
    const { getByTestId } = render(<TestComponent />);

    fireEvent.click(getByTestId("trigger"));

    act(() => {
      vi.runAllTimers();
    });
    expect(getByTestId("content")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    act(() => {
      vi.runAllTimers();
    });

    expect(getByTestId("content")).toBeInTheDocument();
  });

  it("closes on Escape when dismissible is set", () => {
    const { getByTestId, queryByTestId } = render(
      <TestComponent dismissible />,
    );

    fireEvent.click(getByTestId("trigger"));

    act(() => {
      vi.runAllTimers();
    });
    expect(getByTestId("content")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    act(() => {
      vi.runAllTimers();
    });

    expect(queryByTestId("content")).not.toBeInTheDocument();
  });

  it("renders non-asChild triggers and actions correctly", () => {
    const { getByRole, queryByRole } = render(
      <AlertDialog>
        <AlertDialog.Trigger>Open Alert</AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Cancel>Close</AlertDialog.Cancel>
          <AlertDialog.Action>Confirm</AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog>,
    );

    fireEvent.click(getByRole("button", { name: "Open Alert" }));
    act(() => {
      vi.runAllTimers();
    });

    expect(getByRole("button", { name: "Close" })).toBeInTheDocument();
    const confirmBtn = getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toBeInTheDocument();
    expect(confirmBtn).toHaveClass("rnx-button--solid-primary");

    fireEvent.click(confirmBtn);
    act(() => {
      vi.runAllTimers();
    });

    expect(queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("warns when subcomponents are rendered outside AlertDialog.Content", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    render(
      <AlertDialog>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        </AlertDialog.Footer>
      </AlertDialog>,
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "AlertDialog.Footer should be rendered inside <AlertDialog.Content>",
      ),
    );
    consoleWarnSpy.mockRestore();
  });
});
