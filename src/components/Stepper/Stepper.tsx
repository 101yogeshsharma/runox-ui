"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";
import "./Stepper.css";

export interface Step {
  title: string;
  description?: string;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[];
  currentStep: number;
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      steps,
      currentStep,
      size = "md",
      orientation = "horizontal",
      className,
      ...props
    },
    ref
  ) => {
    const circleSizes = {
      sm: "h-6 w-6 text-xs border-2",
      md: "h-8 w-8 text-sm border-2",
      lg: "h-10 w-10 text-base border-[3px]",
    };
    const iconSizes = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    };
    const titleSizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };
    const descSizes = {
      sm: "text-xs",
      md: "text-xs",
      lg: "text-sm",
    };

    const isVertical = orientation === "vertical";

    return (
      <Box
        ref={ref}
        className={cn(
          "flex w-full",
          isVertical ? "flex-col" : "flex-row",
          className
        )}
        {...props}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <Box
              key={index}
              className={cn(
                "relative flex",
                isVertical ? "flex-row" : "flex-1 flex-col"
              )}
            >
              {/* Indicator column: circle + connecting line stacked vertically */}
              <Box
                className={cn(
                  "relative z-10 flex",
                  isVertical ? "flex-col items-center" : "flex-row items-center"
                )}
              >
                <Box
                  className={cn(
                    "rnx-stepper-indicator flex shrink-0 items-center justify-center",
                    circleSizes[size],
                    isCompleted
                      ? "rnx-stepper-indicator--completed"
                      : isActive
                        ? "rnx-stepper-indicator--active"
                        : "rnx-stepper-indicator--inactive"
                  )}
                >
                  {isCompleted ? (
                    <Check className={iconSizes[size]} strokeWidth={3} />
                  ) : (
                    <Box as="span">{index + 1}</Box>
                  )}
                </Box>
                {!isLast && (
                  <Box
                    className={cn(
                      "rnx-stepper-separator relative overflow-hidden",
                      isVertical
                        ? "my-2 min-h-8 w-0.5 flex-1"
                        : "mx-2 h-0.5 flex-1"
                    )}
                  >
                    <Box
                      className={cn(
                        "rnx-stepper-separator-fill absolute",
                        isVertical
                          ? "start-0 top-0 w-full"
                          : "start-0 top-0 h-full"
                      )}
                      style={
                        isVertical
                          ? { height: isCompleted ? "100%" : "0%" }
                          : { width: isCompleted ? "100%" : "0%" }
                      }
                    />
                  </Box>
                )}
              </Box>

              {/* For vertical, we need to position the text to the right of the circle and line */}
              {isVertical ? (
                <Box className={cn("ms-4 flex-1 pb-8", isLast ? "pb-0" : "")}>
                  <Box
                    className={cn(
                      "rnx-stepper-title",
                      titleSizes[size],
                      isActive || isCompleted
                        ? "rnx-stepper-title--active"
                        : "rnx-stepper-title--inactive",
                      size === "sm" ? "mt-1" : size === "md" ? "mt-1.5" : "mt-2"
                    )}
                  >
                    {step.title}
                  </Box>
                  {step.description && (
                    <Box
                      className={cn("rnx-stepper-desc mt-0.5", descSizes[size])}
                    >
                      {step.description}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box className={cn("mt-2", isLast ? "" : "pe-4")}>
                  <Box
                    className={cn(
                      "rnx-stepper-title",
                      titleSizes[size],
                      isActive || isCompleted
                        ? "rnx-stepper-title--active"
                        : "rnx-stepper-title--inactive"
                    )}
                  >
                    {step.title}
                  </Box>
                  {step.description && (
                    <Box
                      className={cn("rnx-stepper-desc mt-0.5", descSizes[size])}
                    >
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

Stepper.displayName = "Stepper";
