"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";
import {
  useFloatingPosition,
  useClickOutside,
  useControllableState,
} from "../../hooks";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { rnx } from "../../utils/rnx";
import "./Select.css";

interface SelectContextValue {
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  disabled?: boolean;
  variant?: "outline" | "filled" | "glass";
  size?: "sm" | "md" | "lg";
  selectedLabel: string | undefined;
  setSelectedLabel: (label: string | undefined) => void;
  contentId: string;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

export function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context)
    throw new Error("Select components must be used within a Select provider");
  return context;
}

export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  variant?: "outline" | "filled" | "glass";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SelectRoot = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      children,
      value: controlledValue,
      defaultValue,
      onValueChange,
      disabled,
      variant = "outline",
      size = "md",
      className,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | undefined>();
    const [value, setValue] = useControllableState<string | undefined>({
      prop: controlledValue,
      defaultProp: defaultValue,
      onChange: (val) => {
        if (val !== undefined && onValueChange) {
          onValueChange(val);
        }
      },
    });
    const rawId = React.useId();
    const contentId = `rnx-select-content-${rawId.replace(/:/g, "")}`;

    const contextValue: SelectContextValue = {
      value,
      onValueChange: setValue,
      isOpen,
      setIsOpen,
      triggerRef,
      disabled,
      variant,
      size,
      selectedLabel,
      setSelectedLabel,
      contentId,
    };

    return (
      <SelectContext.Provider value={contextValue}>
        <Box
          {...rnx({ component: "Select", state: isOpen ? "open" : "closed" })}
          ref={ref}
          className={cn("rnx-select", className)}
        >
          {children}
        </Box>
      </SelectContext.Provider>
    );
  },
);
SelectRoot.displayName = "Select";

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ children, className, onClick, onKeyDown, ...props }, ref) => {
  const { isOpen, setIsOpen, triggerRef, disabled, variant, size, contentId } =
    useSelectContext();
  const mergedRef = useMergeRefs(ref, triggerRef);

  return (
    <button
      ref={mergedRef}
      type="button"
      role="combobox"
      aria-expanded={isOpen}
      aria-controls={contentId}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setIsOpen(true);
        }
      }}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setIsOpen(!isOpen);
      }}
      className={cn(
        "rnx-select-trigger",
        `rnx-select-trigger--variant-${variant || "outline"}`,
        `rnx-select-trigger--size-${size || "md"}`,
        className,
      )}
      {...props}
    >
      {children}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "Select.Trigger";

export interface SelectValueProps {
  placeholder?: React.ReactNode;
  className?: string;
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    const { selectedLabel, value } = useSelectContext();
    return (
      <Box
        as="span"
        ref={ref}
        className={cn("rnx-select-value truncate flex-1 text-left", className)}
        {...props}
      >
        {selectedLabel !== undefined ? selectedLabel : value || placeholder}
      </Box>
    );
  },
);
SelectValue.displayName = "Select.Value";

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  matchTriggerWidth?: boolean;
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ children, className, matchTriggerWidth = true, ...props }, ref) => {
  const { isOpen, setIsOpen, triggerRef, contentId } = useSelectContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergeRefs(contentRef, ref);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
    else {
      const timer = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const position = useFloatingPosition(
    triggerRef,
    contentRef,
    isOpen,
    4,
    mounted,
    "bottom",
    "center",
  );

  useClickOutside(contentRef, (e) => {
    if (triggerRef.current?.contains(e.target as Node)) return;
    if (isOpen) setIsOpen(false);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleNavigation = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter")
        return;
      e.preventDefault();
      const items = Array.from(
        contentRef.current?.querySelectorAll<HTMLElement>(
          '[role="option"]:not([aria-disabled="true"])',
        ) || [],
      );
      if (!items.length) return;

      const currentIndex = items.findIndex(
        (item) => item === document.activeElement,
      );
      if (e.key === "Enter") {
        if (currentIndex !== -1) items[currentIndex].click();
        return;
      }

      const nextIndex =
        e.key === "ArrowDown"
          ? currentIndex < items.length - 1
            ? currentIndex + 1
            : 0
          : currentIndex > 0
            ? currentIndex - 1
            : items.length - 1;
      items[nextIndex].focus();
    };

    document.addEventListener("keydown", handleNavigation);
    return () => document.removeEventListener("keydown", handleNavigation);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mounted) return;
    const timer = setTimeout(() => {
      const selected = contentRef.current?.querySelector<HTMLElement>(
        '[role="option"][aria-selected="true"]',
      );
      const first = contentRef.current?.querySelector<HTMLElement>(
        '[role="option"]:not([aria-disabled="true"])',
      );
      (selected || first)?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen, mounted]);
  if (!mounted || typeof document === "undefined") return null;

  let matchedWidth: number | undefined;
  if (position && triggerRef.current && contentRef.current) {
    const anchorRect = triggerRef.current.getBoundingClientRect();
    matchedWidth = anchorRect.width;
  }

  return createPortal(
    <Box
      ref={mergedRef}
      role="listbox"
      id={contentId}
      className={cn("rnx-select-content z-50", className)}
      data-state={isOpen && position ? "open" : "closed"}
      data-side={position?.placed || "bottom"}
      style={{
        position: "fixed",
        top: position?.top || 0,
        left: position?.left || 0,
        visibility: position ? "visible" : "hidden",
        width: matchTriggerWidth ? matchedWidth : undefined,
      }}
      {...props}
    >
      <div className="rnx-select-viewport p-1">{children}</div>
    </Box>,
    document.body,
  );
});
SelectContent.displayName = "Select.Content";

export interface SelectItemProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "value" | "onSelect"
> {
  value: string;
  label?: string;
  disabled?: boolean;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  (
    {
      children,
      value: itemValue,
      label,
      disabled,
      className,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const { value, onValueChange, setIsOpen, setSelectedLabel } =
      useSelectContext();
    const isSelected = value === itemValue;
    const itemLabel =
      label || (typeof children === "string" ? children : undefined);

    useEffect(() => {
      if (isSelected && itemLabel !== undefined) {
        setSelectedLabel(itemLabel);
      }
      return () => {
        if (isSelected) setSelectedLabel(undefined);
      };
    }, [isSelected, itemLabel, setSelectedLabel]);

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onValueChange(itemValue);
            setIsOpen(false);
          }
        }}
        data-selected={isSelected}
        data-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cn("rnx-select-item", className)}
        onClick={(event) => {
          onClick?.(event);
          if (!disabled && !event.defaultPrevented) {
            onValueChange(itemValue);
            setIsOpen(false);
          }
        }}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  },
);
SelectItem.displayName = "Select.Item";

export interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  SelectSeparatorProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rnx-select-separator", className)} {...props} />
));
SelectSeparator.displayName = "Select.Separator";

export interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rnx-select-group", className)} {...props} />
  ),
);
SelectGroup.displayName = "Select.Group";

export interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rnx-select-label", className)} {...props} />
  ),
);
SelectLabel.displayName = "Select.Label";

export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
  Separator: SelectSeparator,
  Group: SelectGroup,
  Label: SelectLabel,
});
