"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { Flex } from "../../atoms/Flex";
import {
  useFloatingPosition,
  useClickOutside,
  useControllableState,
} from "../../hooks";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";
import { Button } from "../Button";
import { Badge } from "../Badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../Command/Command";
import "./Dropdown.css";

interface DropdownContextValue {
  value: string | string[] | undefined;
  onValueChange: (value: string | string[]) => void;
  multiple: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentId: string;
}

const DropdownContext = createContext<DropdownContextValue | undefined>(
  undefined,
);

export function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error(
      "Dropdown components must be used within a Dropdown provider",
    );
  }
  return context;
}

/**
 * Props for the Dropdown component.
 */
export interface DropdownProps {
  children: React.ReactNode;
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
}

const DropdownRoot = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    { children, value: controlledValue, onValueChange, multiple = false },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const triggerRef = useRef<HTMLButtonElement>(null);
    const rawId = React.useId();
    const contentId = `rnx-dropdown-content-${rawId.replace(/:/g, "")}`;

    const [value, setValue] = useControllableState<string | string[]>({
      prop: controlledValue,
      defaultProp: multiple ? [] : "",
      onChange: onValueChange,
    });

    const contextValue: DropdownContextValue = {
      value,
      onValueChange: setValue,
      multiple,
      isOpen,
      setIsOpen,
      searchQuery,
      setSearchQuery,
      triggerRef,
      contentId,
    };

    return (
      <DropdownContext.Provider value={contextValue}>
        <Box ref={ref} className={cn("rnx-dropdown")}>
          {children}
        </Box>
      </DropdownContext.Provider>
    );
  },
);
DropdownRoot.displayName = "Dropdown";

export interface DropdownTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "size" | "color"
> {
  placeholder?: string;
  width?: string | number;
  size?: "sm" | "md" | "lg";
}

export const DropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownTriggerProps
>(({ placeholder, className, width, size = "md", ...props }, ref) => {
  const {
    value,
    multiple,
    isOpen,
    setIsOpen,
    onValueChange,
    triggerRef,
    contentId,
  } = useDropdownContext();
  const mergedRef = useMergeRefs(ref, triggerRef);

  const removeTag = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    if (multiple) {
      const currentArray = Array.isArray(value) ? value : [];
      onValueChange(currentArray.filter((v) => v !== optionValue));
    }
  };

  const renderContent = () => {
    if (
      props.children &&
      (!value || (Array.isArray(value) && value.length === 0))
    )
      return props.children;
    if (multiple) {
      const currentArray = Array.isArray(value) ? value : [];
      if (currentArray.length === 0) return placeholder;

      return (
        <Flex wrap gap="xs">
          {currentArray.map((v) => (
            <Badge
              key={v}
              variant="solid"
              size={size}
              className="rnx-dropdown-badge flex items-center gap-1 px-1"
            >
              {v}
              <Box
                role="button"
                tabIndex={0}
                aria-label={`Remove ${v}`}
                className="rnx-dropdown-badge-remove-btn"
                onClick={(e) => removeTag(e, v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    removeTag(e as any, v);
                  }
                }}
              >
                <X
                  className={cn(
                    "rnx-dropdown-badge-remove-icon",
                    size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3",
                  )}
                />
              </Box>
            </Badge>
          ))}
        </Flex>
      );
    }

    return value ? String(value) : placeholder;
  };

  const multiDropdownClasses = {
    sm: "h-auto min-h-8 py-1 px-2 text-xs",
    md: "h-auto min-h-10 py-2 px-3 text-sm",
    lg: "h-auto min-h-12 py-3 px-4 text-base",
  };

  return (
    <Button
      ref={mergedRef}
      variant="outline"
      size={multiple ? undefined : size}
      role="combobox"
      aria-expanded={isOpen}
      aria-controls={contentId}
      aria-haspopup="listbox"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "rnx-dropdown-trigger justify-between",
        (!value || (Array.isArray(value) && value.length === 0)) &&
          "rnx-dropdown-trigger-empty",
        multiple ? multiDropdownClasses[size] : "",
        !width && "w-48",
        className,
      )}
      style={{ width, minWidth: width }}
      {...props}
    >
      <Flex className="flex-1 overflow-hidden text-left">
        {renderContent()}
      </Flex>
      <ChevronsUpDown className="rnx-dropdown-icon ml-2 h-4 w-4 shrink-0" />
    </Button>
  );
});
DropdownTrigger.displayName = "Dropdown.Trigger";

export interface DropdownContentProps {
  children: React.ReactNode;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  matchTriggerWidth?: boolean;
}

export const DropdownContent = React.forwardRef<
  HTMLDivElement,
  DropdownContentProps
>(
  (
    {
      children,
      className,
      searchable = false,
      searchPlaceholder = "Search...",
      matchTriggerWidth = true,
      ...props
    },
    ref,
  ) => {
    const { isOpen, setIsOpen, triggerRef, contentId } = useDropdownContext();
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

    if (!mounted || typeof document === "undefined") return null;

    let matchedWidth: number | undefined;
    if (position && triggerRef.current && contentRef.current) {
      const anchorRect = triggerRef.current.getBoundingClientRect();
      matchedWidth = anchorRect.width;
    }

    return createPortal(
      <Box
        ref={mergedRef}
        role="menu"
        className={cn("rnx-dropdown-content z-50", className)}
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
        <Command>
          {searchable && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList id={contentId}>{children}</CommandList>
        </Command>
      </Box>,
      document.body,
    );
  },
);
DropdownContent.displayName = "Dropdown.Content";

export interface DropdownItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof CommandItem>,
  "value" | "onSelect"
> {
  onSelect?: () => void;
  value?: string;
  children: React.ReactNode;
  className?: string;
}

export const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  (
    { children, value: itemValue, onSelect: onSelectProp, className, ...props },
    ref,
  ) => {
    const { value, onValueChange, multiple, setIsOpen } = useDropdownContext();

    const isSelectable = itemValue !== undefined;
    const isSelected =
      isSelectable &&
      (multiple
        ? Array.isArray(value) && value.includes(itemValue)
        : value === itemValue);

    const handleSelect = () => {
      if (onSelectProp) onSelectProp();

      if (isSelectable) {
        if (multiple) {
          const currentArray = Array.isArray(value) ? value : [];
          if (currentArray.includes(itemValue)) {
            onValueChange(currentArray.filter((v) => v !== itemValue));
          } else {
            onValueChange([...currentArray, itemValue]);
          }
        } else {
          onValueChange(itemValue === value ? "" : itemValue);
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
      }
    };

    return (
      <CommandItem
        ref={ref}
        role="menuitem"
        value={
          itemValue ||
          (typeof children === "string" ? children.toLowerCase() : undefined)
        }
        onSelect={handleSelect}
        data-disabled={props.disabled}
        className={cn(
          "rnx-dropdown__item",
          props.disabled && "rnx-dropdown__item--disabled",
          isSelected && "rnx-dropdown__item--selected",
          isSelectable && "relative pl-8",
          className,
        )}
        {...rnx({
          component: "DropdownItem",
          state: isSelected ? "selected" : "unselected",
        })}
        {...props}
      >
        {isSelectable && (
          <Flex align="center" justify="center" className="absolute left-2">
            <Check
              className={cn(
                "h-4 w-4",
                isSelected
                  ? "rnx-dropdown-item-icon-selected"
                  : "rnx-dropdown-item-icon-unselected",
              )}
            />
          </Flex>
        )}
        {children}
      </CommandItem>
    );
  },
);
DropdownItem.displayName = "Dropdown.Item";

export interface DropdownEmptyProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownEmpty = React.forwardRef<
  HTMLDivElement,
  DropdownEmptyProps
>(({ children, className, ...props }, ref) => {
  return (
    <CommandEmpty ref={ref} className={className} {...props}>
      {children}
    </CommandEmpty>
  );
});
DropdownEmpty.displayName = "Dropdown.Empty";

export interface DropdownGroupProps {
  children: React.ReactNode;
  heading?: React.ReactNode;
  className?: string;
}

export const DropdownGroup = React.forwardRef<
  HTMLDivElement,
  DropdownGroupProps
>(({ children, heading, className, ...props }, ref) => {
  return (
    <CommandGroup ref={ref} heading={heading} className={className} {...props}>
      {children}
    </CommandGroup>
  );
});
DropdownGroup.displayName = "Dropdown.Group";

export interface DropdownSearchProps {
  placeholder?: string;
  className?: string;
}

export const DropdownSearch = React.forwardRef<
  HTMLInputElement,
  DropdownSearchProps
>(({ placeholder = "Search...", className, ...props }, ref) => {
  return (
    <CommandInput
      ref={ref}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
});
DropdownSearch.displayName = "Dropdown.Search";

export interface DropdownDividerProps extends React.ComponentPropsWithoutRef<
  typeof CommandSeparator
> {}

export const DropdownDivider = React.forwardRef<
  React.ElementRef<typeof CommandSeparator>,
  DropdownDividerProps
>((props, ref) => {
  return (
    <CommandSeparator
      ref={ref}
      {...props}
      className={cn("bg-border -mx-1 h-px", props.className)}
    />
  );
});
DropdownDivider.displayName = "Dropdown.Divider";

export const Dropdown = Object.assign(DropdownRoot, {
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  Empty: DropdownEmpty,
  Group: DropdownGroup,
  Search: DropdownSearch,
  Divider: DropdownDivider,
  Separator: DropdownDivider,
});
