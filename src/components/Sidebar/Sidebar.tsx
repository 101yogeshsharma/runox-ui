"use client";
import "./Sidebar.css";
import { Box } from "../../atoms/Box";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import type {
  PolymorphicComponentPropsWithRef,
} from "../../utils/types";
import { createPortal } from "react-dom";
import { Menu } from "lucide-react";
import { Button } from "../Button";
import { rnx } from "../../utils/rnx";

const sidebarVariants = cva(
  "rnx-sidebar",
  {
    variants: {
      variant: {
        solid: "",
        glass: "rnx-sidebar--variant-glass",
        floating: "rnx-sidebar--variant-floating",
      },
      collapsed: {
        true: "rnx-sidebar--collapsed",
        false: "rnx-sidebar--expanded",
      },
    },
    defaultVariants: {
      variant: "solid",
      collapsed: false,
    },
  }
);

/**
 * Props for the Sidebar component.
 */
export interface SidebarProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant = "solid", collapsed, mobileOpen, onMobileClose, ...props }, ref) => {
    const sidebar = (
      <aside
        {...rnx({ component: 'Sidebar', state: collapsed ? 'inactive' : 'active' })}
        ref={ref}
        data-collapsed={collapsed}
        className={cn(
          sidebarVariants({ variant, collapsed }),
          mobileOpen && "rnx-sidebar--mobile-open",
          className
        )}
        {...props}
      />
    );

    return (
      <>
        {mobileOpen && typeof document !== "undefined"
          ? createPortal(
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Sidebar overlay"
                className="rnx-sidebar-backdrop"
                onClick={onMobileClose}
              />,
              document.body
            )
          : null}
        {sidebar}
      </>
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
    className={cn("rnx-sidebar-header", className)}
    {...props}
  />
));
SidebarHeader.displayName = "Sidebar.Header";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("rnx-sidebar-content", className)}
    {...props}
  />
));
SidebarContent.displayName = "Sidebar.Content";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("rnx-sidebar-footer", className)}
    {...props}
  />
));
SidebarFooter.displayName = "Sidebar.Footer";

const sidebarItemVariants = cva(
  "rnx-sidebar-item",
  {
    variants: {
      active: {
        true: "rnx-sidebar-item--active",
        false: "",
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
            className="rnx-sidebar-item-icon"
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

(SidebarItem as React.FC).displayName = "Sidebar.Item";

const SidebarMobileToggle = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">
>((props, ref) => (
  <Button ref={ref} variant="ghost" size="icon" aria-label={props["aria-label"] || "Open sidebar"} {...props}>
    <Menu className="h-5 w-5" />
  </Button>
));
SidebarMobileToggle.displayName = "Sidebar.MobileToggle";

const SidebarNamespace = Object.assign(Sidebar, {
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Item: SidebarItem,
  MobileToggle: SidebarMobileToggle,
});

export {
  SidebarNamespace as Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarMobileToggle,
};
