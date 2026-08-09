"use client";
import { Box } from "../../atoms/Box";

import * as React from "react";
import { cn } from "../../utils/cn";
import { useTheme } from "../ThemeProvider/ThemeProvider";
import "./ScrollArea.css";

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { config } = useTheme();
  return (
    <Box
      className={cn(
        "relative overflow-hidden",
        `rounded-${config.radius}`,
        className
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

// ScrollBar is kept for backward compatibility but doesn't render anything
// since scrollbars are now handled entirely by native CSS.
const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "vertical" | "horizontal";
  }
>(() => null);
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
