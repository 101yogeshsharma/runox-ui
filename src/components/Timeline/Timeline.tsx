import * as React from "react";
import { Box } from "../../atoms/Box";
import { cn } from "../../utils/cn";
import "./Timeline.css";
import { rnx } from "../../utils/rnx";

const TimelineContext = React.createContext<{
  orientation: "vertical" | "horizontal";
}>({
  orientation: "vertical",
});

/**
 * Props for the Timeline component.
 */
export interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  orientation?: "vertical" | "horizontal";
}

const TimelineRoot = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <TimelineContext.Provider value={{ orientation }}>
        <Box
          {...rnx({ component: "Timeline" })}
          as="ul"
          ref={ref}
          className={cn(
            "rnx-timeline",
            orientation === "horizontal" && "rnx-timeline--horizontal",
            className,
          )}
          {...props}
        />
      </TimelineContext.Provider>
    );
  },
);
TimelineRoot.displayName = "Timeline";

export interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  status?: "completed" | "active" | "pending" | "error";
}

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, status, ...props }, ref) => {
    const { orientation } = React.useContext(TimelineContext);
    return (
      <Box
        as="li"
        ref={ref}
        className={cn(
          "rnx-timeline-item",
          orientation === "vertical"
            ? "rnx-timeline-item--vertical"
            : "rnx-timeline-item--horizontal",
          status && `rnx-timeline-item--status-${status}`,
          className,
        )}
        {...props}
      />
    );
  },
);
TimelineItem.displayName = "Timeline.Item";

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
        orientation === "vertical"
          ? "rnx-timeline-separator--vertical"
          : "rnx-timeline-separator--horizontal",
        className,
      )}
      {...props}
    />
  );
});
TimelineSeparator.displayName = "Timeline.Separator";

export interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "ghost";
  status?: "completed" | "active" | "pending" | "error";
  color?:
    "default" | "primary" | "secondary" | "danger" | "success" | "warning";
}

export const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  (
    { className, variant = "default", status, color = "default", ...props },
    ref,
  ) => {
    const { orientation } = React.useContext(TimelineContext);
    let mappedColor = color;
    if (status === "completed") {
      mappedColor = "success";
    } else if (status === "active") {
      mappedColor = "primary";
    } else if (status === "error") {
      mappedColor = "danger";
    }

    return (
      <Box
        ref={ref}
        className={cn(
          "rnx-timeline-dot",
          `rnx-timeline-dot--variant-${variant}`,
          `rnx-timeline-dot--color-${mappedColor}`,
          orientation === "vertical"
            ? "rnx-timeline-dot--vertical"
            : "rnx-timeline-dot--horizontal",
          status && `rnx-timeline-dot--status-${status}`,
          props.children ? "rnx-timeline-dot--with-children" : undefined,
          className,
        )}
        {...props}
      />
    );
  },
);
TimelineDot.displayName = "Timeline.Dot";

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
        orientation === "vertical"
          ? "rnx-timeline-connector--vertical"
          : "rnx-timeline-connector--horizontal",
        className,
      )}
      {...props}
    />
  );
});
TimelineConnector.displayName = "Timeline.Connector";

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
        orientation === "vertical"
          ? "rnx-timeline-content--vertical"
          : "rnx-timeline-content--horizontal",
        className,
      )}
      {...props}
    />
  );
});
TimelineContent.displayName = "Timeline.Content";

export const Timeline = Object.assign(TimelineRoot, {
  Item: TimelineItem,
  Separator: TimelineSeparator,
  Dot: TimelineDot,
  Connector: TimelineConnector,
  Content: TimelineContent,
});
