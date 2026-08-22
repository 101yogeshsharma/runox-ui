import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./Calendar";

describe("Calendar modes", () => {
  it("supports multiple-date selection and removal", () => {
    const onValueChange = vi.fn();
    render(
      <Calendar
        mode="multiple"
        defaultValue={[new Date(2026, 7, 15)]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /August 16, 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith([
      new Date(2026, 7, 15),
      new Date(2026, 7, 16),
    ]);
  });

  it("supports range selection", () => {
    const onValueChange = vi.fn();
    render(<Calendar mode="range" onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("button", { name: /August 10, 2026/ }));
    fireEvent.click(screen.getByRole("button", { name: /August 12, 2026/ }));

    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 7, 10),
      to: new Date(2026, 7, 12),
    });
  });

  it("supports time-only mode and second precision", () => {
    const onValueChange = vi.fn();
    render(
      <Calendar
        mode="time"
        showSeconds
        defaultValue={new Date(2026, 7, 15, 9, 10, 11)}
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByDisplayValue("09:10:11");
    fireEvent.change(input, { target: { value: "12:30:45" } });

    expect(onValueChange).toHaveBeenLastCalledWith(
      new Date(2026, 7, 15, 12, 30, 45),
    );
  });

  it("preserves time when selecting a date with a time picker", () => {
    const onValueChange = vi.fn();
    render(
      <Calendar
        showTimePicker
        value={new Date(2026, 7, 15, 9, 10)}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /August 16, 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(
      new Date(2026, 7, 16, 9, 10),
    );
  });

  it("navigates between months and supports an earlier range end", () => {
    const onValueChange = vi.fn();
    render(
      <Calendar
        mode="range"
        showOutsideDays={false}
        value={{ from: new Date(2026, 7, 15) }}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /August 10, 2026/ }));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 7, 10),
      to: new Date(2026, 7, 15),
    });

    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("grid", { name: "July 2026" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(
      screen.getByRole("grid", { name: "August 2026" }),
    ).toBeInTheDocument();
  });
});
