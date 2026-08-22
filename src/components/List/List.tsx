"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "../../utils/cn";
import { ChevronRight } from "lucide-react";
import { Box } from "../../atoms/Box";
import { Flex } from "../../atoms/Flex";
import { Text } from "../../atoms/Text";
import "./List.css";

export type ListVariant = "bullet" | "number" | "icon" | "none";
export type ListSize = "sm" | "md" | "lg";

export interface ListContextValue {
  variant: ListVariant;
  size: ListSize;
  icon?: React.ReactNode;
}

const ListContext = createContext<ListContextValue>({
  variant: "none",
  size: "md",
});

/**
 * Props for the List component.
 */
export interface ListProps extends React.HTMLAttributes<
  HTMLUListElement | HTMLOListElement
> {
  as?: "ul" | "ol";
  variant?: ListVariant;
  size?: ListSize;
  icon?: React.ReactNode;
}

const ListComponent = React.forwardRef<
  HTMLUListElement | HTMLOListElement,
  ListProps
>(
  (
    { className, as, variant = "none", size = "md", icon, children, ...props },
    ref
  ) => {
    // If variant is number, default to ol, else ul
    const Component = as || (variant === "number" ? "ol" : "ul");

    const contextValue = React.useMemo(
      () => ({ variant, size, icon }),
      [variant, size, icon]
    );

    return (
      <ListContext.Provider value={contextValue}>
        <Component
          ref={ref as React.Ref<HTMLOListElement & HTMLUListElement>}
          className={cn(
            "rnx-list",
            `rnx-list--${variant}`,
            `rnx-list--${size}`,
            className
          )}
          {...props}
        >
          {children}
        </Component>
      </ListContext.Provider>
    );
  }
);
ListComponent.displayName = "List";

export interface ListItemProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  "title"
> {
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  title?: React.ReactNode;
  isDragging?: boolean;
}

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      className,
      children,
      icon,
      collapsible,
      defaultExpanded = false,
      title,
      isDragging,
      ...props
    },
    ref
  ) => {
    const context = useContext(ListContext);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    // useId must be called unconditionally (Rules of Hooks)
    const collapsibleId = React.useId();

    const isBulletOrNumber =
      context.variant === "bullet" || context.variant === "number";

    if (collapsible) {
      const contentId = `list-collapsible-${collapsibleId}`;
      return (
        <Box
          as="li"
          ref={ref}
          className={cn(
            "rnx-list-item-collapsible",
            isDragging && "rnx-list-item-collapsible--dragging",
            className
          )}
          {...props}
        >
          <button
            type="button"
            className="rnx-list-item-collapsible-btn"
            aria-expanded={isExpanded}
            aria-controls={contentId}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Text
              as="div"
              className="rnx-list-item-collapsible-title"
            >
              {title}
            </Text>
            <ChevronRight
              className={cn(
                "rnx-list-item-collapsible-icon",
                isExpanded && "rotate-90"
              )}
            />
          </button>
          <div
            id={contentId}
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <Box className="rnx-list-item-collapsible-content">{children}</Box>
            </div>
          </div>
        </Box>
      );
    }

    return (
      <Box
        as="li"
        ref={ref}
        className={cn(
          !isBulletOrNumber && "rnx-list-item",
          context.variant === "number" && "rnx-list-item-number",
          context.variant === "bullet" && "rnx-list-item-bullet",
          isDragging && "rnx-list-item--dragging",
          className
        )}
        {...props}
      >
        {/* Render custom icon if variant is icon */}
        {!isBulletOrNumber && (icon || context.icon) && (
          <Box as="span" className="rnx-list-item-icon-wrapper">
            {icon || context.icon}
          </Box>
        )}

        {/* For bullet/number, just wrap children. For icon/none, wrap in span to align with icon */}
        {isBulletOrNumber ? (
          <Text as="span" className="text-foreground">
            {children}
          </Text>
        ) : (
          <Box className="flex-1">{children}</Box>
        )}
      </Box>
    );
  }
);
ListItem.displayName = "ListItem";

export interface ListIconProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const ListIcon = React.forwardRef<HTMLSpanElement, ListIconProps>(
  ({ className, children, ...props }, ref) => (
    <Flex
      as="span"
      align="center"
      justify="center"
      ref={ref}
      className={cn("flex-shrink-0", className)}
      {...props}
    >
      {children}
    </Flex>
  )
);
ListIcon.displayName = "ListIcon";

export const List = Object.assign(ListComponent, {
  Item: ListItem,
  Icon: ListIcon,
});
