"use client";
import { Box } from "../../atoms/Box";

import * as React from "react";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";
import "./ScrollArea.css";

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <Box
      {...rnx({ component: "ScrollArea" })}
      className={cn(
        "rnx-scroll-area-container relative overflow-hidden",
        className,
      )}
    >
      <Box
        ref={ref}
        className="rnx-scroll-area rnx-scroll-area--inherit-radius h-full w-full"
        {...props}
      >
        {children}
      </Box>
    </Box>
  );
});
ScrollArea.displayName = "ScrollArea";

export interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <Box
        ref={ref}
        role="scrollbar"
        aria-orientation={orientation}
        className={cn(
          "rnx-scrollbar flex touch-none select-none transition-colors",
          orientation === "vertical" &&
            "h-full w-2.5 border-l border-l-transparent p-[1px]",
          orientation === "horizontal" &&
            "h-2.5 flex-col border-t border-t-transparent p-[1px]",
          className,
        )}
        {...props}
      >
        <Box className="rnx-scrollbar-thumb relative flex-1 rounded-full bg-border" />
      </Box>
    );
  },
);
ScrollBar.displayName = "ScrollArea.Bar";

export const ScrollAreaNamespace = Object.assign(ScrollArea, {
  Bar: ScrollBar,
});
export { ScrollAreaNamespace as ScrollArea };
