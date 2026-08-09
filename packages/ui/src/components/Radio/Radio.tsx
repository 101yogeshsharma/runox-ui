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

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(
  undefined
);

export interface RadioGroupProps extends Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "onChange"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      name: customName,
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

    const contextValue = React.useMemo(
      () => ({
        name,
        value: currentValue,
        onValueChange: handleValueChange,
      }),
      [name, currentValue, handleValueChange]
    );

    const { style: consumerStyle, ...rest } = props;
    return (
      <RadioGroupContext.Provider value={contextValue}>
        <Box
          as="fieldset"
          ref={ref}
          style={consumerStyle}
          className={cn("rnx-radio-group m-0 border-none p-0", className)}
          {...rest}
        />
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "color" | "value"
> {
  value: string; // value is required for Radio
  label?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      label,
      error,
      size = "md",
      color = "primary",
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

    const name = context?.name || _name;
    const isChecked = context ? context.value === value : _checked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      if (e.target.checked && context) {
        context.onValueChange(value);
      }
    };

    return (
      <Box className={cn("rnx-radio-wrapper", className)}>
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
              `rnx-radio-box--${color}`,
              error && "rnx-radio-box--error"
            )}
          >
            <Box className="rnx-radio-indicator" />
          </Box>
        </Box>
        {(label || children || error) && (
          <Box className="rnx-radio-content">
            {(label || children) && (
              <Label htmlFor={id} className="rnx-radio-label">
                {label || children}
              </Label>
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

Radio.displayName = "Radio";
