"use client";
import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import { Check, Circle } from "lucide-react";
import { cn } from "../../utils/cn";
import { CONTEXT_MENU_EXIT_DURATION_MS } from "../../internal/timings";
import { useContextMenuPosition, useClickOutside } from "../../hooks";

import "./ContextMenu.css";

const ContextMenuContext = createContext<{
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  slotEl: HTMLDivElement | null;
  setSlotEl: (el: HTMLDivElement | null) => void;
  /** Element to portal the menu into. Defaults to `document.body`. */
  container?: HTMLElement;
} | null>(null);

/**
 * Props for the ContextMenu component.
 */
export interface ContextMenuProps {
  children: React.ReactNode;
  /**
   * Element to portal the context menu into. Defaults to `document.body`.
   * Useful for tests or rendering inside a specific container.
   */
  container?: HTMLElement;
}

const ContextMenuRoot = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ children, container }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [slotEl, setSlotEl] = useState<HTMLDivElement | null>(null);
    return (
      <ContextMenuContext.Provider
        value={{ isOpen, setIsOpen, slotEl, setSlotEl, container }}
      >
        <Box ref={ref}>{children}</Box>
      </ContextMenuContext.Provider>
    );
  },
);
ContextMenuRoot.displayName = "ContextMenu";

const ContextMenuTrigger = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  const context = useContext(ContextMenuContext);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const mergedRef = (node: HTMLDivElement) => {
    triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref)
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Only set mouse position and open if we have context
    if (context) {
      setMousePos({ x: e.clientX, y: e.clientY });
      context.setIsOpen(true);
    }
  };

  return (
    <Box
      ref={mergedRef}
      onContextMenu={handleContextMenu}
      {...rnx({
        component: "ContextMenu",
        state: context?.isOpen ? "open" : "closed",
        overlay: true,
      })}
      {...props}
    >
      {children}
      <ContextMenuPortal mousePos={mousePos} />
    </Box>
  );
});
ContextMenuTrigger.displayName = "ContextMenuTrigger";

// Internal component to handle rendering the portal content for the Trigger
const ContextMenuPortal = ({
  mousePos,
}: {
  mousePos: { x: number; y: number } | null;
}) => {
  const context = useContext(ContextMenuContext);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const position = useContextMenuPosition(
    mousePos,
    contentRef,
    context?.isOpen || false,
  );

  useClickOutside(contentRef, () => {
    if (context?.isOpen) context.setIsOpen(false);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && context?.isOpen) {
        context.setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [context]);

  useEffect(() => {
    if (context?.isOpen) {
      setMounted(true);
      setShouldRender(true);
    } else {
      setMounted(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [context?.isOpen]);

  if (!shouldRender || typeof document === "undefined") return null;

  return createPortal(
    <Box
      ref={contentRef}
      className="rnx-context-menu-content"
      data-state={mounted ? "open" : "closed"}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? "visible" : "hidden",
        transformOrigin: position?.placed.startsWith("bottom")
          ? "top left"
          : "bottom right",
      }}
    >
      {/* Slot: callback ref into context state so ContextMenuContent re-renders when the slot mounts */}
      <Box ref={context?.setSlotEl}></Box>
    </Box>,
    context?.container ?? document.body,
  );
};

const ContextMenuContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const context = useContext(ContextMenuContext);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (context?.isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(
        () => setShouldRender(false),
        CONTEXT_MENU_EXIT_DURATION_MS,
      );
      return () => clearTimeout(timer);
    }
  }, [context?.isOpen]);

  const slot = context?.slotEl;

  if (!shouldRender || !slot || typeof document === "undefined") return null;

  return createPortal(
    <Box
      ref={ref}
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    >
      {children}
    </Box>,
    slot,
  );
});
ContextMenuContent.displayName = "ContextMenu.Content";

const ContextMenuItem = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; disabled?: boolean }
>(({ className, inset, disabled, ...props }, ref) => {
  const context = useContext(ContextMenuContext);
  return (
    <Box
      ref={ref}
      role="menuitem"
      aria-disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        if (props.onClick) props.onClick(e);
        context?.setIsOpen(false);
      }}
      className={cn(
        "rnx-context-menu-item",
        inset && "rnx-context-menu-item--inset",
        className,
      )}
      data-disabled={disabled}
      {...props}
    />
  );
});
ContextMenuItem.displayName = "ContextMenu.Item";

const ContextMenuCheckboxItem = forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "onCheckedChange"> & {
    checked?: boolean;
    disabled?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }
>(
  (
    { className, children, checked, disabled, onCheckedChange, ...props },
    ref,
  ) => {
    const context = useContext(ContextMenuContext);
    return (
      <Box
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) return;
          if (props.onClick) props.onClick(e);
          if (onCheckedChange) onCheckedChange(!checked);
          context?.setIsOpen(false);
        }}
        className={cn(
          "rnx-context-menu-item rnx-context-menu-item--inset",
          className,
        )}
        data-disabled={disabled}
        {...props}
      >
        <Box as="span" className="rnx-context-menu-indicator">
          {checked && <Check className="h-4 w-4" />}
        </Box>
        {children}
      </Box>
    );
  },
);
ContextMenuCheckboxItem.displayName = "ContextMenu.CheckboxItem";

const ContextMenuRadioItem = forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "value"> & {
    value: string;
    checked?: boolean;
    disabled?: boolean;
  }
>(
  (
    { className, children, value: _value, checked, disabled, ...props },
    ref,
  ) => {
    const context = useContext(ContextMenuContext);
    return (
      <Box
        ref={ref}
        role="menuitemradio"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) return;
          if (props.onClick) props.onClick(e);
          context?.setIsOpen(false);
        }}
        className={cn(
          "rnx-context-menu-item rnx-context-menu-item--inset",
          className,
        )}
        data-disabled={disabled}
        {...props}
      >
        <Box as="span" className="rnx-context-menu-indicator">
          {checked && <Circle className="h-2 w-2 fill-current" />}
        </Box>
        {children}
      </Box>
    );
  },
);
ContextMenuRadioItem.displayName = "ContextMenu.RadioItem";

const ContextMenuLabel = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn(
      "rnx-context-menu-label",
      inset && "rnx-context-menu-item--inset",
      className,
    )}
    {...props}
  />
));
ContextMenuLabel.displayName = "ContextMenu.Label";

const ContextMenuSeparator = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    role="separator"
    className={cn("rnx-context-menu-divider", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenu.Separator";

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <Box
    as="span"
    className={cn("rnx-context-menu-shortcut", className)}
    {...props}
  />
);
ContextMenuShortcut.displayName = "ContextMenu.Shortcut";

// Dummy components to preserve export API without adding complexity for nested sub-menus right now
const ContextMenuGroup = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
ContextMenuGroup.displayName = "ContextMenu.Group";

const ContextMenuSub = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
ContextMenuSub.displayName = "ContextMenu.Sub";

const ContextMenuSubTrigger = ContextMenuItem;

const ContextMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn(className, "flex w-full flex-col gap-0.5")}
    {...props}
  >
    {children}
  </Box>
));
ContextMenuSubContent.displayName = "ContextMenu.SubContent";

const ContextMenuRadioGroup = ({
  children,
  value: _value,
  onValueChange,
  ...props
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <Box role="group" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const element = child as React.ReactElement<any>;
          return React.cloneElement(element, {
            checked: element.props.value === _value,
            onClick: (e: React.MouseEvent) => {
              if (onValueChange && element.props.value) {
                onValueChange(element.props.value);
              }
              if (element.props.onClick) element.props.onClick(e);
            },
          });
        }
        return child;
      })}
    </Box>
  );
};
ContextMenuRadioGroup.displayName = "ContextMenu.RadioGroup";

export const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioItem: ContextMenuRadioItem,
  Label: ContextMenuLabel,
  Separator: ContextMenuSeparator,
  Shortcut: ContextMenuShortcut,
  Group: ContextMenuGroup,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
  RadioGroup: ContextMenuRadioGroup,
});
