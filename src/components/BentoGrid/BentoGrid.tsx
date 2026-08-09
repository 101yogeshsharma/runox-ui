"use client";
import { Box } from "../../atoms/Box";

import React from "react";
import { cn } from "../../utils/cn";

export const BentoGrid = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    children?: React.ReactNode;
  } & React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className
      )}
      {...props}
    >
      {children}
    </Box>
  );
});
BentoGrid.displayName = "BentoGrid";

export const BentoGridItem = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
  } & React.ComponentPropsWithoutRef<"div">
>(({ className, title, description, header, icon, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      className={cn(
        "group/bento bg-card text-card-foreground border-border hover:bg-accent/30 row-span-1 flex flex-col justify-between space-y-4 rounded-xl border p-4 transition duration-200",
        "dark:hover:border-border/80 shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-none",
        className
      )}
      {...props}
    >
      {header}
      <Box className="transition duration-200">
        {icon}
        <Box className="text-foreground mt-2 mb-2 font-sans font-bold">
          {title}
        </Box>
        <Box className="text-muted-foreground font-sans text-xs font-normal">
          {description}
        </Box>
      </Box>
    </Box>
  );
});
BentoGridItem.displayName = "BentoGridItem";
