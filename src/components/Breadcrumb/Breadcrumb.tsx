"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";

import "./Breadcrumb.css";

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode;
  variant?: "default" | "pills" | "glass";
  size?: "sm" | "md" | "lg";
}

const BreadcrumbContext = React.createContext<{
  variant?: "default" | "pills" | "glass";
  size?: "sm" | "md" | "lg";
}>({});

export const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ variant = "default", size = "md", children, ...props }, ref) => (
    <BreadcrumbContext.Provider value={{ variant, size }}>
      <Box {...rnx({ component: 'Breadcrumb' })} as="nav" ref={ref} aria-label="breadcrumb" {...props}>
        {children}
      </Box>
    </BreadcrumbContext.Provider>
  )
);
BreadcrumbRoot.displayName = "Breadcrumb.Root";

export const BreadcrumbList = forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => {
  const { variant, size } = React.useContext(BreadcrumbContext);
  return (
    <Box
      as="ol"
      ref={ref}
      className={cn(
        "rnx-breadcrumb-list",
        size && `rnx-breadcrumb-list--${size}`,
        variant && variant !== "default" && `rnx-breadcrumb-list--variant-${variant}`,
        className
      )}
      {...props}
    />
  );
});
BreadcrumbList.displayName = "Breadcrumb.List";

export const BreadcrumbItem = forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <Box
    as="li"
    ref={ref}
    className={cn("rnx-breadcrumb-item", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "Breadcrumb.Item";

export const BreadcrumbLink = forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { active?: boolean }
>(({ className, active, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "rnx-breadcrumb-link",
      active && "rnx-breadcrumb-link--active",
      className
    )}
    aria-current={active ? "page" : undefined}
    {...props}
  />
));
BreadcrumbLink.displayName = "Breadcrumb.Link";

export const BreadcrumbPage = forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <Box
    as="span"
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("rnx-breadcrumb-page", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "Breadcrumb.Page";

export const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"li">) => (
  <Box
    as="li"
    role="presentation"
    aria-hidden="true"
    className={cn("rnx-breadcrumb-separator", className)}
    {...props}
  >
    {children ?? <ChevronRight className="rnx-breadcrumb-separator-icon" />}
  </Box>
);
BreadcrumbSeparator.displayName = "Breadcrumb.Separator";

// Maintain the old unified component for backwards compatibility while we transition
const BreadcrumbComponent: React.FC<
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
> = ({ children, className, separator = <ChevronRight />, ...props }) => {
  const items = React.Children.toArray(children);

  return (
    <BreadcrumbRoot className={className} {...props}>
      <BreadcrumbList>
        {items.map((child, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>{child}</BreadcrumbItem>
            {index < items.length - 1 && (
              <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
};
BreadcrumbComponent.displayName = "Breadcrumb";

export const Breadcrumb = Object.assign(BreadcrumbComponent, {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
});
