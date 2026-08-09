"use client";
import { Box } from "../../atoms/Box";
import React, { forwardRef } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode;
}

export const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ ...props }, ref) => (
    <Box as="nav" ref={ref} aria-label="breadcrumb" {...props} />
  )
);
BreadcrumbRoot.displayName = "BreadcrumbRoot";

export const BreadcrumbList = forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <Box
    as="ol"
    ref={ref}
    className={cn(
      "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItem = forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <Box
    as="li"
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

export const BreadcrumbLink = forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { active?: boolean }
>(({ className, active, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "hover:text-foreground transition-colors",
      active ? "text-foreground font-normal" : "",
      className
    )}
    aria-current={active ? "page" : undefined}
    {...props}
  />
));
BreadcrumbLink.displayName = "BreadcrumbLink";

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
    className={cn("text-foreground font-normal", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

export const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"li">) => (
  <Box
    as="li"
    role="presentation"
    aria-hidden="true"
    className={className}
    {...props}
  >
    {children ?? <ChevronRight className="h-3.5 w-3.5" />}
  </Box>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// Maintain the old unified component for backwards compatibility while we transition
export const Breadcrumb: React.FC<
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
