import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Calendar } from "./Calendar";

describe("Calendar", () => {
  it("exposes date state and supports keyboard date movement", async () => {
    render(
      <Calendar
        value={new Date(2026, 7, 15)}
        onValueChange={() => undefined}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Previous month" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next month" }),
    ).toBeInTheDocument();

    const selected = screen.getByRole("button", {
      name: /August 15, 2026/,
    });
    expect(selected).toHaveAttribute("aria-selected", "true");

    selected.focus();
    fireEvent.keyDown(selected, { key: "ArrowRight" });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /August 16, 2026/ }),
      ).toHaveFocus();
    });
  });
});
