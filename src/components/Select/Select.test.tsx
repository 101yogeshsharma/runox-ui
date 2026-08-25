import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Select } from "./Select";

describe("Select", () => {
  it("connects the trigger to the popup and supports keyboard selection", async () => {
    const user = userEvent.setup();
    render(
      <Select defaultValue="one">
        <Select.Trigger>
          <Select.Value placeholder="Choose an option" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="one">One</Select.Item>
          <Select.Item value="two">Two</Select.Item>
        </Select.Content>
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
        <Select.Trigger>
          <Select.Value placeholder="Choose an option" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="one">One</Select.Item>
        </Select.Content>
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
        <Select.Trigger>
          <Select.Value placeholder="Choose an option" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="disabled" disabled>
            Disabled
          </Select.Item>
          <Select.Item value="enabled">Enabled</Select.Item>
        </Select.Content>
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
