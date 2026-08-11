"use client";
import "./Sidebar.css";
import { Box } from "../../atoms/Box";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import type {
  PolymorphicComponentPropsWithRef,
} from "../../utils/types";

const sidebarVariants = cva(
  "flex h-screen flex-col border-e bg-background transition-all duration-300 ease-in-out",
  {
    variants: {
      collapsed: {
        true: "w-16",
        false: "w-full md:w-64",
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
);

export interface SidebarProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, collapsed, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        data-collapsed={collapsed}
        className={cn(sidebarVariants({ collapsed }), className)}
        {...props}
      />
    );
  }
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("flex h-14 items-center border-b px-4", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("flex-1 overflow-auto py-2", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("flex items-center border-t p-4", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

const sidebarItemVariants = cva(
  "group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      active: {
        true: "bg-secondary text-secondary-foreground",
        false: "text-muted-foreground",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export interface SidebarItemBaseProps extends VariantProps<
  typeof sidebarItemVariants
> {
  icon?: React.ReactNode;
}

export type SidebarItemProps<C extends React.ElementType> =
  PolymorphicComponentPropsWithRef<C, SidebarItemBaseProps>;

type SidebarItemComponent = <C extends React.ElementType = "a">(
  props: SidebarItemProps<C>
) => React.ReactElement | null;

const SidebarItem: SidebarItemComponent = React.forwardRef(
  (
    {
      className,
      active,
      icon,
      children,
      as,
      ...props
    }: React.ComponentPropsWithoutRef<"a"> &
      SidebarItemBaseProps & { as?: React.ElementType },
    ref: React.Ref<HTMLElement>
  ) => {
    const Component = as || "a";
    return (
      <Component
        ref={ref}
        className={cn(sidebarItemVariants({ active }), className)}
        {...props}
      >
        {icon && (
          <Box
            as="span"
            className="flex h-4 w-4 shrink-0 items-center justify-center"
          >
            {icon}
          </Box>
        )}
        <Box as="span" className="rnx-sidebar-item__label truncate">
          {children}
        </Box>
      </Component>
    );
  }
) as SidebarItemComponent;

(SidebarItem as React.FC).displayName = "SidebarItem";

const SidebarNamespace = Object.assign(Sidebar, {
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Item: SidebarItem,
});

export {
  SidebarNamespace as Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
};
