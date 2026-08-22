"use client";
import { Box } from "../../atoms/Box";
import React, {
  forwardRef,
  useId,
  useState,
  createContext,
  useContext,
} from "react";
import { cn } from "../../utils/cn";
import { mergeProps } from "../../utils/mergeProps";
import { Label } from "../Label/Label";
import "./Radio.css";
import { rnx } from "../../utils/rnx";
import { withLoading } from "../../utils/withLoading";


import { RnxColor } from "../../types";

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onValueChange: (value: string) => void;
  color?: RnxColor;
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(
  undefined
);

export interface RadioGroupProps extends Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "onChange" | "color"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  variant?: "list" | "cards" | "buttons" | "pills";
  color?: RnxColor;
  error?: string;
}

const RadioGroupComponent = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      name: customName,
      variant = "list",
      color,
      error,
      children,
      ...props
    },
    ref
  ) => {
    const generatedName = useId();
    const name = customName || generatedName;

    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const currentValue = isControlled ? value : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    return (
      <RadioGroupContext.Provider
        value={{
          name,
          value: currentValue,
          onValueChange: handleValueChange,
          color,
        }}
      >
        <Box
          as="fieldset"
          ref={ref}
          className={cn(
            "rnx-radio-group",
            variant && `rnx-radio-group--variant-${variant}`,
            className
          )}
          {...rnx({ component: 'RadioGroup' })}
          {...props}
        >
          {children}
        </Box>
        {error && (
          <Box as="span" className="rnx-radio-error-text">
            {error}
          </Box>
        )}
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroupComponent.displayName = "Radio.Group";

/**
 * A group of mutually exclusive options where only one option can be selected.
 */
export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "value"
> {
  value: string; // value is required for Radio
  variant?: "default" | "card" | "pill" | "subtle" | "bordered";
  label?: string;
  description?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  color?: RnxColor;
}

const RadioBase = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      variant = "default",
      label,
      description,
      error,
      size = "md",
      color,
      id: customId,
      value,
      onChange,
      children,
      checked: _checked,
      name: _name,
      ...props
    },
    ref
  ) => {
    const context = useContext(RadioGroupContext);
    const generatedId = useId();
    const id = customId || generatedId;
    const effectiveColor = color || context?.color || "primary";

    const name = context?.name || _name;
    const isChecked = context ? context.value === value : _checked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      if (e.target.checked && context) {
        context.onValueChange(value);
      }
    };

    return (
      <Box
        className={cn(
          "rnx-radio-wrapper",
          `rnx-radio-wrapper--variant-${variant}`,
          className
        )}
        {...rnx({
          component: "Radio",
          state: props.disabled ? "disabled" : error ? "error" : isChecked ? "checked" : "default",
        })}
      >
        <Box className="rnx-radio-container">
          <input
            ref={ref}
            {...mergeProps(
              {
                type: "radio",
                id,
                name,
                value,
                checked: isChecked,
                onChange: handleChange,
                className: "rnx-radio-input",
                "aria-invalid": !!error,
                "aria-describedby": error ? `${id}-error` : undefined,
              },
              props
            )}
          />
          <Box
            className={cn(
              "rnx-radio-box",
              `rnx-radio-box--${size}`,
              `rnx-radio-box--${effectiveColor}`,
              error && "rnx-radio-box--error"
            )}
          >
            <Box className="rnx-radio-indicator" />
          </Box>
        </Box>
        {(label || children || description || error) && (
          <Box className="rnx-radio-content">
            {(label || children) && (
              <Label htmlFor={id} className="rnx-radio-label">
                {label || children}
              </Label>
            )}
            {description && (
              <Box as="span" id={`${id}-desc`} className="rnx-radio-description">
                {description}
              </Box>
            )}
            {error && (
              <Box
                as="span"
                id={`${id}-error`}
                className="rnx-radio-error-text"
              >
                {error}
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }
);

RadioBase.displayName = "Radio";
const RadioWithLoading = withLoading(RadioBase);
export const Radio = Object.assign(RadioWithLoading, {
  Group: RadioGroupComponent,
});
