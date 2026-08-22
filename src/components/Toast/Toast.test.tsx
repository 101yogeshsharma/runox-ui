import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ToastProvider, useToast } from "./Toast";

function ToastTrigger() {
  const { toast } = useToast();
  return (
    <button
      onClick={() =>
        toast({ description: "Saved", duration: 10000, title: "Success" })
      }
    >
      Notify
    </button>
  );
}

describe("ToastProvider", () => {
  it("removes a toast once after repeated dismissal", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Notify" }));
    const dismiss = await screen.findByRole("button", {
      name: "Dismiss notification",
    });
    await user.click(dismiss);
    await user.click(dismiss);

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });
});
