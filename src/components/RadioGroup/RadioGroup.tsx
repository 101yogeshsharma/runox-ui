"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef, createContext, useContext, useId } from "react";
import { cn } from "../../utils/cn";
import { useControllableState } from "../../hooks";
import { Label } from "../Label/Label";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";

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

/**
 * Props for the RadioGroup component.
 */
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

const RadioGroupBase = forwardRef<HTMLDivElement, RadioGroupProps>(
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
    ref,
  ) => {
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
          {...rnx({ component: "RadioGroup" })}
          ref={ref}
          role="radiogroup"
          className={cn(
            "rnx-radio-group",
            orientation === "horizontal" && "rnx-radio-group--horizontal",
            className,
          )}
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroupBase.displayName = "RadioGroup";
const RadioGroupWithLoading = withLoading(RadioGroupBase);

export interface RadioGroupItemProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "name" | "checked" | "onChange"
> {
  value: string;
  label?: string;
}

const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
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
            className={cn(
              "rnx-radio-box",
              `rnx-radio-box--size-${context.size}`,
            )}
          >
            <Box
              className={cn(
                "rnx-radio-indicator",
                `rnx-radio-indicator--size-${context.size}`,
              )}
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
  },
);
RadioGroupItem.displayName = "RadioGroup.Item";

export const RadioGroup = Object.assign(RadioGroupWithLoading, {
  Item: RadioGroupItem,
});
