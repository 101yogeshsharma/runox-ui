"use client";
import React, {
  forwardRef,
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";
import { useControllableState } from "../../hooks";

import "./Tabs.css";

const TabsContext = createContext<{
  activeValue?: string;
  setActiveValue: (value: string) => void;
  variant?: "default" | "underline" | "pills" | "bordered" | "glass";
  id?: string;
  size?: "sm" | "md" | "lg";
}>({
  setActiveValue: () => {},
});

/**
 * A set of tabbed panels that allow switching between multiple content panels in a single space.
 */
export interface TabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "default" | "underline" | "pills" | "bordered" | "glass";
  size?: "sm" | "md" | "lg";
}

const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      variant = "default",
      size = "md",
      ...props
    },
    ref
  ) => {
    const [activeValue, setActiveValue] = useControllableState({
      prop: value,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });
    const uniqueId = React.useId();

    const handleSetActiveValue = useCallback(
      (v: string) => setActiveValue(v),
      [setActiveValue]
    );

    const contextValue = React.useMemo(() => ({
      activeValue,
      setActiveValue: handleSetActiveValue,
      variant,
      id: uniqueId,
      size,
    }), [activeValue, handleSetActiveValue, variant, uniqueId, size]);

    return (
      <TabsContext.Provider value={contextValue}>
        <Box
          ref={ref}
          className={cn("rnx-tabs", className)}
          {...props}
        />
      </TabsContext.Provider>
    );
  }
);
TabsRoot.displayName = "Tabs";

export const TabsList = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { activeValue, variant } = useContext(TabsContext);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const listRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  const mergedRef = useCallback(
    (node: HTMLDivElement) => {
      listRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement>).current = node;
    },
    [ref]
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const updateIndicator = () => {
      const activeTab = list.querySelector(
        `[data-state="active"]`
      ) as HTMLElement;
      if (activeTab) {
        setIndicatorStyle({
          left: activeTab.offsetLeft,
          width: activeTab.offsetWidth,
          opacity: 1,
        });
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    // ResizeObserver catches element visibility changes, font loading layout shifts, and regular resizes better than window.resize
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(list);

    // Also observe all tabs in the list to handle label/content width shifts
    const tabs = list.querySelectorAll(`[role="tab"]`);
    tabs.forEach((tab) => observer.observe(tab));

    return () => {
      observer.disconnect();
    };
  }, [activeValue]);

  return (
    <Box
      ref={mergedRef}
      role="tablist"
      className={cn(
        "rnx-tabs-list",
        variant && variant !== "default" && `rnx-tabs-list--variant-${variant}`,
        className
      )}
      {...props}
    >
      <Box
        className={cn(
          "rnx-tabs-indicator",
          `rnx-tabs-indicator--${variant || "default"}`
        )}
        style={{
          width: indicatorStyle.width,
          transform: `translateX(${indicatorStyle.left}px)`,
          opacity: indicatorStyle.opacity,
          ...(mountedRef.current ? {} : { transition: "none" }),
        }}
      />
      {children}
    </Box>
  );
});
TabsList.displayName = "Tabs.List";

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const {
      activeValue,
      setActiveValue,
      size = "md",
      id,
    } = useContext(TabsContext);

    const isActive = activeValue === value;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!disabled) setActiveValue(value);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        // Find all tab buttons in the nearest tablist
        const tablist = (e.currentTarget as HTMLElement).closest(
          "[role='tablist']"
        );
        if (!tablist) return;
        const tabs = Array.from(
          tablist.querySelectorAll<HTMLElement>("[role='tab']:not([disabled])")
        );
        const currentIndex = tabs.indexOf(e.currentTarget as HTMLElement);
        const nextIndex =
          e.key === "ArrowRight"
            ? (currentIndex + 1) % tabs.length
            : (currentIndex - 1 + tabs.length) % tabs.length;
        tabs[nextIndex]?.focus();
        tabs[nextIndex]?.click();
      }
    };

    return (
      <Box
        as="button"
        ref={ref}
        type="button"
        id={`rnx-tabs-trigger-${id}-${value}`}
        role="tab"
        aria-selected={isActive}
        aria-controls={`rnx-tabs-content-${id}-${value}`}
        data-state={isActive ? "active" : "inactive"}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setActiveValue(value);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "rnx-tabs-trigger",
          `rnx-tabs-trigger--${size}`,
          className
        )}
        {...rnx({ component: "TabTrigger", state: isActive ? "active" : "inactive" })}
        {...props}
      >
        <Box as="span" className="relative z-20">
          {children}
        </Box>
      </Box>
    );
  }
);
TabsTrigger.displayName = "Tabs.Trigger";

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeValue, id } = useContext(TabsContext);
    const isActive = activeValue === value;

    return (
      <Box
        ref={ref}
        role="tabpanel"
        id={`rnx-tabs-content-${id}-${value}`}
        aria-labelledby={`rnx-tabs-trigger-${id}-${value}`}
        data-state={isActive ? "active" : "inactive"}
        hidden={!isActive}
        tabIndex={0}
        className={cn("rnx-tabs-content", className)}
        {...props}
      >
        {children}
      </Box>
    );
  }
);
TabsContent.displayName = "Tabs.Content";

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});
