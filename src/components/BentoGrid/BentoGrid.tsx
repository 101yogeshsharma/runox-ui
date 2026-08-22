"use client";
import { Box } from "../../atoms/Box";

import React from "react";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";

import { RnxColor } from "../../types";
import "./BentoGrid.css";

export interface BentoGridProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
  variant?: "default" | "bordered" | "glass" | "subtle";
  color?: RnxColor;
  children?: React.ReactNode;
}

const BentoGridRoot = React.forwardRef<
  HTMLDivElement,
  BentoGridProps
>(({ className, variant = "default", color, children, ...props }, ref) => {
  return (
    <Box
      {...rnx({ component: 'BentoGrid', variant: variant !== "default" ? variant : undefined })}
      ref={ref}
      className={cn(
        "rnx-bento-grid",
        variant && variant !== "default" && `rnx-bento-grid--variant-${variant}`,
        color && `rnx-bento-grid--color-${color}`,
        className
      )}
      {...props}
    >
      {children}
    </Box>
  );
});
BentoGridRoot.displayName = "BentoGrid";

export interface BentoGridItemProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  className?: string;
  variant?: "default" | "bordered" | "glass" | "subtle";
  color?: RnxColor;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}

export const BentoGridItem = React.forwardRef<
  HTMLDivElement,
  BentoGridItemProps
>(({ className, variant = "default", color, title, description, header, icon, ...props }, ref) => {
  return (
    <Box
      ref={ref}
      className={cn(
        "rnx-bento-item",
        variant && variant !== "default" && `rnx-bento-item--variant-${variant}`,
        color && `rnx-bento-item--color-${color}`,
        className
      )}
      {...props}
    >
      {header}
      <Box className="rnx-bento-item__content">
        {icon}
        <Box className="rnx-bento-item__title">
          {title}
        </Box>
        <Box className="rnx-bento-item__description">
          {description}
        </Box>
      </Box>
    </Box>
  );
});
BentoGridItem.displayName = "BentoGrid.Item";

export const BentoGrid = Object.assign(BentoGridRoot, {
  Item: BentoGridItem,
});
