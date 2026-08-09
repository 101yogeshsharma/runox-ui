import { Box } from "../../atoms/Box";
import React from "react";
import { cn } from "../../utils/cn";
import "./Timeline.css";
import { useTheme } from "../ThemeProvider/ThemeProvider";

const TimelineContext = React.createContext<{
  orientation: "vertical" | "horizontal";
}>({
  orientation: "vertical",
});

export interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  orientation?: "vertical" | "horizontal";
}

export const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    const { config } = useTheme();
    return (
      <TimelineContext.Provider value={{ orientation }}>
        <Box
          as="ul"
          ref={ref}
          className={cn(
            "rnx-timeline",
            "m-0 list-none p-0",
            orientation === "horizontal" && "flex w-full flex-row",
            `rounded-${config.radius}`,
            className
          )}
          {...props}
        />
      </TimelineContext.Provider>
    );
  }
);
Timeline.displayName = "Timeline";

export interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {}

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = React.useContext(TimelineContext);
    return (
      <Box
        as="li"
        ref={ref}
        className={cn(
          "rnx-timeline-item",
          "relative flex",
          orientation === "vertical"
            ? "min-h-12 flex-row"
            : "min-w-24 flex-1 flex-col",
          className
        )}
        {...props}
      />
    );
  }
);
TimelineItem.displayName = "TimelineItem";

export interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimelineSeparator = React.forwardRef<
  HTMLDivElement,
  TimelineSeparatorProps
>(({ className, ...props }, ref) => {
  const { orientation } = React.useContext(TimelineContext);
  return (
    <Box
      ref={ref}
      className={cn(
        "rnx-timeline-separator",
        "flex flex-none items-center",
        orientation === "vertical" ? "flex-col" : "w-full flex-row",
        className
      )}
      {...props}
    />
  );
});
TimelineSeparator.displayName = "TimelineSeparator";

export interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "ghost";
  color?:
    "default" | "primary" | "secondary" | "destructive" | "success" | "warning";
}

export const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, variant = "default", color = "default", ...props }, ref) => {
    const { orientation } = React.useContext(TimelineContext);
    return (
      <Box
        ref={ref}
        className={cn(
          "rnx-timeline-dot",
          `rnx-timeline-dot--${variant}`,
          `rnx-timeline-dot--color-${color}`,
          "z-10 flex shrink-0 items-center justify-center",
          orientation === "vertical" ? "my-1.5" : "mx-1.5",
          {
            "h-3 w-3": !props.children, // default small dot
            "h-6 w-6": !!props.children, // larger if containing icon
          },
          className
        )}
        {...props}
      />
    );
  }
);
TimelineDot.displayName = "TimelineDot";

export interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  TimelineConnectorProps
>(({ className, ...props }, ref) => {
  const { orientation } = React.useContext(TimelineContext);
  return (
    <Box
      ref={ref}
      className={cn(
        "rnx-timeline-connector",
        "grow",
        orientation === "vertical" ? "min-h-6 w-px" : "h-px min-w-6",
        className
      )}
      {...props}
    />
  );
});
TimelineConnector.displayName = "TimelineConnector";

export interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimelineContent = React.forwardRef<
  HTMLDivElement,
  TimelineContentProps
>(({ className, ...props }, ref) => {
  const { orientation } = React.useContext(TimelineContext);
  return (
    <Box
      ref={ref}
      className={cn(
        "rnx-timeline-content",
        "flex-1 text-sm",
        orientation === "vertical"
          ? "px-4 pt-0.5 pb-6"
          : "px-2 pt-4 pb-0 text-left",
        className
      )}
      {...props}
    />
  );
});
TimelineContent.displayName = "TimelineContent";
