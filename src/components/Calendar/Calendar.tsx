"use client";
import { Box } from "../../atoms/Box";
import { useControllableState } from "../../hooks/useControllableState";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "../../utils/cn";
import { Input, InputGroup, InputIcon } from "../Input";
import "./Calendar.css";

export type CalendarProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> & {
  mode?: "single" | "multiple" | "range" | "time";
  value?: Date | Date[] | { from?: Date; to?: Date }; // Date | Date[] | { from?: Date; to?: Date }
  defaultValue?: Date | Date[] | { from?: Date; to?: Date };
  onValueChange?: (
    date: Date | Date[] | { from?: Date; to?: Date } | undefined,
  ) => void;
  showOutsideDays?: boolean;

  showTimePicker?: boolean;
  showSeconds?: boolean;
  components?: Record<string, unknown>; // To maintain partial backwards compatibility
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const isSameDay = (
  date1: Date | undefined | null,
  date2: Date | undefined | null,
) => {
  if (!date1 || !date2) return false;
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const normalizeDate = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const isDateInRange = (date: Date, range: { from?: Date; to?: Date }) => {
  if (!range.from || !range.to) return false;
  const time = normalizeDate(date);
  const fromTime = normalizeDate(range.from);
  const toTime = normalizeDate(range.to);
  return time > Math.min(fromTime, toTime) && time < Math.max(fromTime, toTime);
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      className,
      showOutsideDays = true,
      mode = "single",
      value: controlledValue,
      defaultValue,
      onValueChange,
      showTimePicker = false,
      showSeconds = false,
      components: _components,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useControllableState<
      Date | Date[] | { from?: Date; to?: Date } | undefined
    >({
      prop: controlledValue,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    const [currentMonth, setCurrentMonth] = useState<Date>(() => {
      if ((mode === "single" || mode === "time") && value instanceof Date)
        return new Date(value);
      if (mode === "range" && (value as { from?: Date })?.from)
        return new Date((value as { from?: Date }).from!);
      if (mode === "multiple" && Array.isArray(value) && value.length > 0)
        return new Date(value[0]);
      return new Date();
    });

    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonthDays = getDaysInMonth(year, month - 1);
    const nextMonthDays = 42 - (daysInMonth + firstDay); // 6 rows of 7 days

    const handlePrevMonth = () => {
      setCurrentMonth(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
      setCurrentMonth(new Date(year, month + 1, 1));
    };

    const handleDayKeyDown = (event: React.KeyboardEvent, date: Date) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleDateClick(date);
        return;
      }

      const offset = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
      }[event.key as "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown"];
      if (offset === undefined) return;

      event.preventDefault();
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + offset);
      if (nextDate.getMonth() !== month || nextDate.getFullYear() !== year) {
        setCurrentMonth(
          new Date(nextDate.getFullYear(), nextDate.getMonth(), 1),
        );
      }

      requestAnimationFrame(() => {
        const key = `${nextDate.getFullYear()}-${nextDate.getMonth()}-${nextDate.getDate()}`;
        document
          .querySelector<HTMLButtonElement>(`[data-date-key="${key}"]`)
          ?.focus();
      });
    };

    const handleDateClick = (date: Date) => {
      if (mode === "single") {
        if (showTimePicker && value instanceof Date) {
          const newDate = new Date(date);
          newDate.setHours(value.getHours());
          newDate.setMinutes(value.getMinutes());
          setValue(newDate);
        } else {
          setValue(date);
        }
      } else if (mode === "multiple") {
        const selectedDates = Array.isArray(value) ? [...value] : [];
        const existingIndex = selectedDates.findIndex((d) =>
          isSameDay(d, date),
        );
        if (existingIndex >= 0) {
          selectedDates.splice(existingIndex, 1);
        } else {
          selectedDates.push(date);
        }
        setValue(selectedDates);
      } else if (mode === "range") {
        const currentRange = (value as { from?: Date; to?: Date }) || {
          from: undefined,
          to: undefined,
        };
        if (!currentRange.from || (currentRange.from && currentRange.to)) {
          setValue({ from: date, to: undefined });
        } else {
          if (date < currentRange.from) {
            setValue({ from: date, to: currentRange.from });
          } else {
            setValue({ from: currentRange.from, to: date });
          }
        }
      }
    };

    const handleTimeChange = (timeValue: string) => {
      if (mode !== "single" && mode !== "time") return;
      if (!timeValue) return;

      const [hours, minutes, seconds = 0] = timeValue.split(":").map(Number);
      const currentDate = value instanceof Date ? new Date(value) : new Date();
      currentDate.setHours(hours);
      currentDate.setMinutes(minutes);
      currentDate.setSeconds(seconds);
      setValue(currentDate);
    };

    const handleMouseEnter = React.useCallback(
      (date: Date) => {
        if (mode === "range") setHoverDate(date);
      },
      [mode],
    );

    const handleMouseLeave = React.useCallback(() => {
      if (mode === "range") setHoverDate(null);
    }, [mode]);

    const renderDays = () => {
      const days = [];

      // Outside days (prev month)
      for (let i = 0; i < firstDay; i++) {
        const dayNum = prevMonthDays - firstDay + i + 1;
        const date = new Date(year, month - 1, dayNum);
        days.push(renderDayCell(date, true));
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        days.push(renderDayCell(date, false));
      }

      // Outside days (next month)
      for (let i = 1; i <= nextMonthDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push(renderDayCell(date, true));
      }

      const weeks = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(
          <tr key={i} className={"mt-2 flex w-full"}>
            {days.slice(i, i + 7)}
          </tr>,
        );
      }

      return weeks;
    };

    const renderDayCell = (date: Date, isOutside: boolean) => {
      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isRangeMiddle = false;
      const isToday = isSameDay(date, new Date());

      if (mode === "single") {
        isSelected = isSameDay(date, value as Date);
      } else if (mode === "multiple") {
        isSelected =
          Array.isArray(value) && value.some((d) => isSameDay(d, date));
      } else if (mode === "range") {
        const range = value as { from?: Date; to?: Date } | undefined;
        isRangeStart = isSameDay(date, range?.from);
        isRangeEnd = isSameDay(date, range?.to);
        isSelected = isRangeStart || isRangeEnd;

        if (range?.from && range?.to) {
          isRangeMiddle = isDateInRange(date, range);
        } else if (range?.from && !range?.to && hoverDate) {
          isRangeMiddle = isDateInRange(date, {
            from: range.from,
            to: hoverDate,
          });
        }
      }

      return (
        <DayCell
          key={date.toISOString()}
          date={date}
          isOutside={isOutside}
          showOutsideDays={showOutsideDays}
          isSelected={isSelected}
          isRangeStart={isRangeStart}
          isRangeEnd={isRangeEnd}
          isRangeMiddle={isRangeMiddle}
          isToday={isToday}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleDateClick}
          onKeyDown={handleDayKeyDown}
        />
      );
    };

    return (
      <Box
        ref={ref}
        className={cn(
          "rnx-calendar",
          mode !== "time" && "w-fit p-3",
          className,
        )}
        {...props}
      >
        <Box className={"space-y-4"}>
          {mode !== "time" && (
            <>
              <Box className={"relative flex items-center justify-center pt-1"}>
                <Box
                  className={
                    "absolute z-10 flex w-full items-center justify-between px-1 pt-1"
                  }
                >
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className={cn(
                      "rnx-calendar__nav_button inline-flex items-center justify-center",
                      "h-7 w-7 p-0",
                    )}
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className={cn(
                      "rnx-calendar__nav_button inline-flex items-center justify-center",
                      "h-7 w-7 p-0",
                    )}
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Box>
                <Box className={"rnx-calendar__caption_label"}>
                  {MONTHS[month]} {year}
                </Box>
              </Box>

              <table
                role="grid"
                aria-label={`${MONTHS[month]} ${year}`}
                className={"w-full border-collapse space-y-1"}
              >
                <thead>
                  <tr className={"flex"}>
                    {WEEKDAYS.map((day) => (
                      <th key={day} className={"rnx-calendar__weekday w-9"}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{renderDays()}</tbody>
              </table>
            </>
          )}

          {((showTimePicker && mode === "single") || mode === "time") && (
            <Box
              className={cn(
                "flex items-center gap-3",
                mode !== "time" && "rnx-calendar__time_picker mt-3 pt-3",
              )}
            >
              {mode !== "time" && (
                <Clock className="rnx-calendar__clock_icon h-4 w-4" />
              )}
              <InputGroup
                className={cn("w-full", mode === "time" ? "h-10 w-72" : "")}
              >
                {mode === "time" && (
                  <InputIcon position="left">
                    <Clock size={16} className="text-muted-foreground" />
                  </InputIcon>
                )}
                <Input
                  type="time"
                  className={cn(
                    "w-full",
                    mode === "time"
                      ? "h-full justify-start text-left font-normal"
                      : "text-center font-mono tracking-widest",
                  )}
                  step={showSeconds ? "1" : "60"}
                  value={
                    value instanceof Date && !isNaN(value.getTime())
                      ? `${value.getHours().toString().padStart(2, "0")}:${value.getMinutes().toString().padStart(2, "0")}${showSeconds ? ":" + value.getSeconds().toString().padStart(2, "0") : ""}`
                      : ""
                  }
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
              </InputGroup>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
);

interface DayCellProps {
  date: Date;
  isOutside: boolean;
  showOutsideDays: boolean;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isRangeMiddle: boolean;
  isToday: boolean;
  onMouseEnter: (date: Date) => void;
  onMouseLeave: (date: Date) => void;
  onClick: (date: Date) => void;
  onKeyDown: (event: React.KeyboardEvent, date: Date) => void;
}

const DayCell = React.memo(
  ({
    date,
    isOutside,
    showOutsideDays,
    isSelected,
    isRangeStart,
    isRangeEnd,
    isRangeMiddle,
    isToday,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onKeyDown,
  }: DayCellProps) => {
    if (isOutside && !showOutsideDays) {
      return <td className="h-9 w-9 p-0" />;
    }

    const cellClass = cn(
      "rnx-calendar__day inline-flex items-center justify-center whitespace-nowrap",
      "h-9 w-9 p-0 relative focus-within:relative focus-within:z-20",
      isOutside && "rnx-calendar__day--outside",
      isRangeMiddle && "rnx-calendar__day--range-middle",
      isRangeStart && "rnx-calendar__day--range-start",
      isRangeEnd && "rnx-calendar__day--range-end",
      isSelected && "rnx-calendar__day--selected",
      !isSelected && isToday && "rnx-calendar__day--today",
    );

    return (
      <td
        className="relative p-0"
        role="gridcell"
        aria-selected={isSelected}
        onMouseEnter={() => onMouseEnter(date)}
        onMouseLeave={() => onMouseLeave(date)}
      >
        <button
          type="button"
          className={cellClass}
          onClick={() => onClick(date)}
          onKeyDown={(event) => onKeyDown(event, date)}
          aria-label={date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          aria-selected={isSelected}
          aria-current={isToday ? "date" : undefined}
          data-date-key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
        >
          {date.getDate()}
        </button>
      </td>
    );
  },
);
DayCell.displayName = "DayCell";

Calendar.displayName = "Calendar";

export { Calendar };
