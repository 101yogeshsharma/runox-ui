"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef } from "react";
import { Check, X as XIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import "./Stepper.css";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";


export interface Step {
  title: string;
  description?: string;
  status?: "completed" | "active" | "inactive" | "error";
}

/**
 * Props for the Stepper component.
 */
export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[];
  currentStep: number;
  variant?: "circles" | "dots" | "pills";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
}

const StepperBase = forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      steps,
      currentStep,
      variant = "circles",
      size = "md",
      orientation = "horizontal",
      className,
      ...props
    },
    ref
  ) => {
    const isVertical = orientation === "vertical";

    return (
      <Box
        ref={ref}
        role="list"
        aria-label={props["aria-label"] || "Progress"}
        className={cn(
          "rnx-stepper",
          isVertical ? "rnx-stepper--vertical" : "rnx-stepper--horizontal",
          `rnx-stepper--size-${size}`,
          variant && variant !== "circles" && `rnx-stepper--variant-${variant}`,
          className
        )}
        {...rnx({ component: 'Stepper' })}
        {...props}
      >
        {steps.map((step, index) => {
          const isError = step.status === "error";
          const isCompleted = step.status ? step.status === "completed" : index < currentStep;
          const isActive = step.status ? step.status === "active" : index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <Box
              key={index}
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                "relative flex",
                isVertical ? "flex-row" : "flex-1 flex-col items-center"
              )}
            >
              {/* Indicator column: circle + connecting line */}
              <Box
                className={cn(
                  "relative z-10 flex",
                  isVertical ? "flex-col items-center" : "flex-row items-center w-full"
                )}
              >
                <Box
                  className={cn(
                    "rnx-stepper-indicator",
                    isError
                      ? "rnx-stepper-indicator--error"
                      : isCompleted
                        ? "rnx-stepper-indicator--completed"
                        : isActive
                          ? "rnx-stepper-indicator--active"
                          : "rnx-stepper-indicator--inactive"
                  )}
                >
                  {isError ? (
                    <XIcon className="rnx-stepper-indicator-icon" strokeWidth={3} />
                  ) : isCompleted ? (
                    <Check className="rnx-stepper-indicator-icon" strokeWidth={3} />
                  ) : (
                    <Box as="span">{index + 1}</Box>
                  )}
                </Box>
                {!isLast && (
                  <Box
                    className={cn(
                      "rnx-stepper-separator",
                      isVertical
                        ? "rnx-stepper-separator--vertical"
                        : "rnx-stepper-separator--horizontal"
                    )}
                  >
                    <Box
                      className={cn(
                        "rnx-stepper-separator-fill",
                        isVertical
                          ? "rnx-stepper-separator-fill--vertical"
                          : "rnx-stepper-separator-fill--horizontal",
                        isVertical
                          ? (isCompleted ? "h-full" : "h-0")
                          : (isCompleted ? "w-full" : "w-0")
                      )}
                    />
                  </Box>
                )}
              </Box>

              {/* Text content */}
              {isVertical ? (
                <Box className={cn("ms-4 flex-1 pb-8", isLast ? "pb-0" : "")}>
                  <Box
                    className={cn(
                      "rnx-stepper-title",
                      isActive || isCompleted
                        ? "rnx-stepper-title--active"
                        : "rnx-stepper-title--inactive"
                    )}
                  >
                    {step.title}
                  </Box>
                  {step.description && (
                    <Box className="rnx-stepper-desc">
                      {step.description}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box className="mt-2 flex flex-col items-center text-center">
                  <Box
                    className={cn(
                      "rnx-stepper-title",
                      isActive || isCompleted
                        ? "rnx-stepper-title--active"
                        : "rnx-stepper-title--inactive"
                    )}
                  >
                    {step.title}
                  </Box>
                  {step.description && (
                    <Box className="rnx-stepper-desc">
                      {step.description}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  }
);

StepperBase.displayName = "Stepper";
export const Stepper = withLoading(StepperBase);
