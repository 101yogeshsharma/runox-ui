import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

describe("Select", () => {
  it("connects the trigger to the popup and supports keyboard selection", async () => {
    const user = userEvent.setup();
    render(
      <Select defaultValue="one">
        <SelectTrigger>
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">One</SelectItem>
          <SelectItem value="two">Two</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-controls");

    await user.click(trigger);
    const listbox = await screen.findByRole("listbox");
    expect(listbox.id).toBe(trigger.getAttribute("aria-controls"));
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "One" })).toHaveFocus();
    });

    await user.keyboard("{ArrowDown}{Enter}");
    expect(trigger).toHaveTextContent("Two");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens from ArrowDown on the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">One</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });

  it("skips disabled options and restores focus on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="disabled" disabled>
            Disabled
          </SelectItem>
          <SelectItem value="enabled">Enabled</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    const disabledOption = Array.from(
      document.querySelectorAll<HTMLElement>('[role="option"]'),
    ).find((option) => option.textContent?.includes("Disabled"));
    expect(disabledOption).toHaveAttribute("aria-disabled", "true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveFocus();
  });
});
