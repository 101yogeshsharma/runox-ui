"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, createContext, useContext, useId } from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../ThemeProvider/ThemeProvider";
import { useControllableState } from "../../hooks";
import { Label } from "../Label/Label";

const RadioGroupContext = createContext<{
  name: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}>({
  name: "",
  onChange: () => {},
});

export interface RadioGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      name,
      disabled,
      orientation = "vertical",
      size = "md",
      ...props
    },
    ref
  ) => {
    const { config } = useTheme();
    const generatedName = useId();
    const groupName = name || generatedName;

    const [activeValue, setActiveValue] = useControllableState({
      prop: value,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });

    return (
      <RadioGroupContext.Provider
        value={{
          name: groupName,
          value: activeValue,
          onChange: setActiveValue,
          disabled,
          size,
        }}
      >
        <Box
          ref={ref}
          role="radiogroup"
          className={cn(
            "rnx-radio-group",
            `rounded-${config.radius}`,
            orientation === "horizontal" && "rnx-radio-group--horizontal",
            className
          )}
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "name" | "checked" | "onChange"
> {
  value: string;
  label?: string;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, label, id: customId, disabled, ...props }, ref) => {
    const context = useContext(RadioGroupContext);
    const generatedId = useId();
    const id = customId || generatedId;
    const isChecked = context.value === value;
    const isDisabled = disabled || context.disabled;

    return (
      <Box className={cn("rnx-radio-wrapper", className)}>
        <Box className="rnx-radio-container">
          <input
            type="radio"
            ref={ref}
            id={id}
            name={context.name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={(e) => {
              if (e.target.checked) {
                context.onChange(value);
              }
            }}
            className="rnx-radio-input"
            {...props}
          />
          <Box
            className={cn("rnx-radio-box", `rnx-radio-box--${context.size}`)}
          >
            <Box
              className={cn("rnx-radio-dot", `rnx-radio-dot--${context.size}`)}
            />
          </Box>
        </Box>
        {label && (
          <Box className="rnx-radio-content">
            <Label htmlFor={id} className="rnx-radio-label">
              {label}
            </Label>
          </Box>
        )}
      </Box>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";
