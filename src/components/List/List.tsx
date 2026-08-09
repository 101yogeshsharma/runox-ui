"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "../../utils/cn";
import { ChevronRight } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
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

const LIST_VARIANT_STYLES = {
  bullet: "list-disc list-outside pl-6 space-y-2",
  number: "list-decimal list-outside pl-6 space-y-2",
  icon: "list-none pl-0 space-y-3",
  none: "list-none pl-0 space-y-1",
};

const LIST_BASE_CLASS = "rnx-list";
const LIST_ITEM_COLLAPSIBLE_BASE =
  "list-none my-2 overflow-hidden rnx-list-item-collapsible";
const LIST_ITEM_COLLAPSIBLE_DRAGGING = "rnx-list-item-collapsible--dragging";
const LIST_ITEM_COLLAPSIBLE_BUTTON =
  "flex w-full items-center justify-between px-4 py-3 text-left rnx-list-item-collapsible-btn";
const LIST_ITEM_COLLAPSIBLE_TITLE = "rnx-list-item-collapsible-title";
const LIST_ITEM_COLLAPSIBLE_ICON = "h-4 w-4 rnx-list-item-collapsible-icon";
const LIST_ITEM_COLLAPSIBLE_CONTENT =
  "px-4 py-3 rnx-list-item-collapsible-content";
const LIST_ITEM_BASE = "flex items-start gap-3";
const LIST_ITEM_NUMBER = "rnx-list-item-number";
const LIST_ITEM_BULLET = "rnx-list-item-bullet";
const LIST_ITEM_DRAGGING =
  "shadow-md rounded-md z-[var(--z-dropdown)] rnx-list-item--dragging";

const LIST_SIZE_STYLES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

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
            LIST_VARIANT_STYLES[variant],
            LIST_BASE_CLASS,
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
            LIST_ITEM_COLLAPSIBLE_BASE,
            isDragging && LIST_ITEM_COLLAPSIBLE_DRAGGING,
            className
          )}
          {...props}
        >
          <button
            type="button"
            className={LIST_ITEM_COLLAPSIBLE_BUTTON}
            aria-expanded={isExpanded}
            aria-controls={contentId}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Text
              as="div"
              className={cn(
                LIST_ITEM_COLLAPSIBLE_TITLE,
                LIST_SIZE_STYLES[context.size]
              )}
            >
              {title}
            </Text>
            <ChevronRight
              className={cn(
                LIST_ITEM_COLLAPSIBLE_ICON,
                isExpanded && "rotate-90"
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <m.div
                id={contentId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Box className={LIST_ITEM_COLLAPSIBLE_CONTENT}>{children}</Box>
              </m.div>
            )}
          </AnimatePresence>
        </Box>
      );
    }

    return (
      <Box
        as="li"
        ref={ref}
        className={cn(
          LIST_SIZE_STYLES[context.size],
          !isBulletOrNumber && LIST_ITEM_BASE,
          context.variant === "number" && LIST_ITEM_NUMBER,
          context.variant === "bullet" && LIST_ITEM_BULLET,
          isDragging && LIST_ITEM_DRAGGING,
          className
        )}
        {...props}
      >
        {/* Render custom icon if variant is icon */}
        {!isBulletOrNumber && (icon || context.icon) && (
          <Box as="span" className="mt-0.5 flex-shrink-0">
            {icon || context.icon}
          </Box>
        )}

        {/* For bullet/number, just wrap children. For icon/none, wrap in span to align with icon */}
        {isBulletOrNumber ? (
          <Text as="span" className="text-foreground">
            {children}
          </Text>
        ) : (
          <Box className="text-foreground flex-1">{children}</Box>
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
