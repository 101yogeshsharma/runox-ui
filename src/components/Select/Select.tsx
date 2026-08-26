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
import { SELECT_EXIT_DURATION_MS } from "../../internal/timings";
import { warnInvalidProps } from "../../utils/warn";
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

/**
 * Select component (single-value listbox).
 *
 * Compose via dot-notation members: `Select.Trigger`, `Select.Value`,
 * `Select.Content`, `Select.Item`. The listbox portals to `document.body`
 * (or the `container` prop) and supports full keyboard navigation including
 * Home/End and typeahead.
 *
 * @example
 * ```tsx
 * <Select value={v} onValueChange={setV}>
 *   <Select.Trigger><Select.Value placeholder="Pick one" /></Select.Trigger>
 *   <Select.Content>
 *     <Select.Item value="a">A</Select.Item>
 *   </Select.Content>
 * </Select>
 * ```
 */
export interface SelectProps<TValue extends string = string> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  children: React.ReactNode;
  /** Controlled selected value. */
  value?: TValue | undefined;
  /** Initial value for uncontrolled usage. */
  defaultValue?: TValue | undefined;
  /** Called when the selection changes. */
  onValueChange?: (value: TValue) => void;
  disabled?: boolean;
  variant?: "outline" | "filled" | "glass";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Controlled open state. */
  open?: boolean;
  /** Called when the open state should change. */
  onOpenChange?: (open: boolean) => void;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
}

const SelectRoot = React.forwardRef<HTMLDivElement, SelectProps<any>>(
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
      open: openProp,
      onOpenChange,
      defaultOpen = false,
      ...props
    },
    ref,
  ) => {
    if (process.env.NODE_ENV !== "production") {
      if (controlledValue !== undefined && !onValueChange) {
        warnInvalidProps(
          "Select",
          "`value` provided without `onValueChange` — the select is controlled but selection changes will be lost. Pass `onValueChange` or use `defaultValue` instead.",
        );
      }
    }
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlledOpen = openProp !== undefined;
    const isOpen = isControlledOpen ? openProp : internalOpen;
    const setIsOpen = React.useCallback(
      (next: boolean) => {
        if (!isControlledOpen) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isControlledOpen, onOpenChange],
    );
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | undefined>();
    const [value, setValue] = useControllableState<string | undefined>({
      prop: controlledValue,
      defaultProp: defaultValue,
      onChange: (val) => {
        if (onValueChange) {
          // Forward as-is: a cleared selection is `undefined`, not "".
          // Coercing would hand consumers an invalid TValue.
          onValueChange(val as any);
        }
      },
    });
    const rawId = React.useId();
    const contentId = `rnx-select-content-${rawId.replaceAll(":", "")}`;

    const contextValue: SelectContextValue = React.useMemo(
      () => ({
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
      }),
      [
        value,
        setValue,
        isOpen,
        setIsOpen,
        triggerRef,
        disabled,
        variant,
        size,
        selectedLabel,
        setSelectedLabel,
        contentId,
      ],
    );

    return (
      <SelectContext.Provider value={contextValue}>
        <Box
          {...rnx({ component: "Select", state: isOpen ? "open" : "closed" })}
          ref={ref}
          className={cn("rnx-select", className)}
          {...props}
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

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, onClick, onKeyDown, ...props }, ref) => {
    const {
      isOpen,
      setIsOpen,
      triggerRef,
      disabled,
      variant,
      size,
      contentId,
    } = useSelectContext();
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
  },
);
SelectTrigger.displayName = "Select.Trigger";

export interface SelectValueProps {
  placeholder?: React.ReactNode;
  className?: string;
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
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
  /**
   * Element to portal the listbox into. Defaults to `document.body`.
   * Useful for tests or rendering inside a specific container.
   */
  container?: HTMLElement;
  /**
   * Skip the exit animation: the listbox unmounts immediately on close.
   * Recommended in tests to avoid fake-timer coupling.
   * @default false
   */
  disableExitAnimation?: boolean;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  (
    {
      children,
      className,
      matchTriggerWidth = true,
      container,
      disableExitAnimation = false,
      ...props
    },
    ref,
  ) => {
    const { isOpen, setIsOpen, triggerRef, contentId } = useSelectContext();
    const contentRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergeRefs(contentRef, ref);
    const [mounted, setMounted] = useState(false);
    // Holds the latest navigation handler; invoked from the listbox's own
    // onKeyDown so keystrokes only affect this instance's open menu.
    const navigationRef = useRef<((e: React.KeyboardEvent) => void) | null>(
      null,
    );

    useEffect(() => {
      if (isOpen) setMounted(true);
      else if (disableExitAnimation) setMounted(false);
      else {
        const timer = setTimeout(
          () => setMounted(false),
          SELECT_EXIT_DURATION_MS,
        );
        return () => clearTimeout(timer);
      }
    }, [isOpen, disableExitAnimation]);

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
      let typeaheadBuffer = "";
      let typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

      const focusItem = (item: HTMLElement | undefined) => item?.focus();

      const getEnabledItems = () =>
        Array.from(
          contentRef.current?.querySelectorAll<HTMLElement>(
            '[role="option"]:not([aria-disabled="true"])',
          ) || [],
        );

      // Scoped to the listbox element (attached via onKeyDown on the portal
      // content below) so two simultaneously-open Selects never both react to
      // the same keystrokes.
      const handleNavigation = (e: React.KeyboardEvent) => {
        const items = getEnabledItems();
        if (items.length === 0) return;
        const currentIndex = items.indexOf(
          document.activeElement as HTMLElement,
        );

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          let nextIndex: number;
          if (e.key === "ArrowDown") {
            nextIndex =
              currentIndex >= 0 && currentIndex < items.length - 1
                ? currentIndex + 1
                : 0;
          } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          }
          focusItem(items[nextIndex]);
          return;
        }

        if (e.key === "Home" || e.key === "End") {
          e.preventDefault();
          focusItem(e.key === "Home" ? items[0] : items[items.length - 1]);
          return;
        }

        // Typeahead: jump to the next option starting with the typed characters.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          typeaheadBuffer += e.key.toLowerCase();
          if (typeaheadTimer) clearTimeout(typeaheadTimer);
          typeaheadTimer = setTimeout(() => {
            typeaheadBuffer = "";
          }, 500);

          // Search from the position after the current item, wrapping around.
          const ordered = [
            ...items.slice(currentIndex + 1),
            ...items.slice(0, Math.max(currentIndex + 1, 0)),
          ];
          const match = ordered.find((item) =>
            (item.textContent || "").toLowerCase().startsWith(typeaheadBuffer),
          );
          focusItem(match);
        }
      };

      navigationRef.current = handleNavigation;
      return () => {
        navigationRef.current = null;
        if (typeaheadTimer) clearTimeout(typeaheadTimer);
      };
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
        onKeyDown={(e) => {
          // Only respond when focus is inside this listbox — prevents
          // multi-instance interference when several Selects are open.
          if (!contentRef.current?.contains(document.activeElement)) return;
          navigationRef.current?.(e);
        }}
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
      container ?? document.body,
    );
  },
);
SelectContent.displayName = "Select.Content";

export interface SelectItemProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "value" | "onSelect"
> {
  value: string;
  label?: string;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
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
      // Deliberately no cleanup that clears selectedLabel on unmount: items
      // unmount when the listbox closes (after the exit animation), but the
      // selected value persists — the trigger must keep showing its label.
      // Stale labels are harmless: if the value changes, the newly selected
      // item overwrites the label; if the item is removed entirely, the
      // trigger falls back to the raw value.
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
        // Roving tabindex: only the focused/selected option is tabbable.
        // Arrow-key navigation (handled at the listbox level) moves focus;
        // Tab skips the list entirely, per WAI-ARIA listbox pattern.
        tabIndex={-1}
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

const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rnx-select-separator", className)}
      {...props}
    />
  ),
);
SelectSeparator.displayName = "Select.Separator";

export interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rnx-select-group", className)} {...props} />
  ),
);
SelectGroup.displayName = "Select.Group";

export interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
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
