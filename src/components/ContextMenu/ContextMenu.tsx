"use client";
import { Box } from "../../atoms/Box";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "../../utils/cn";
import { useContextMenuPosition, useClickOutside } from "../../hooks";

const ContextMenuContext = createContext<{
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  slotEl: HTMLDivElement | null;
  setSlotEl: (el: HTMLDivElement | null) => void;
} | null>(null);

export interface ContextMenuProps {
  children: React.ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [slotEl, setSlotEl] = useState<HTMLDivElement | null>(null);
  return (
    <ContextMenuContext.Provider
      value={{ isOpen, setIsOpen, slotEl, setSlotEl }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
};

export const ContextMenuTrigger = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  const context = useContext(ContextMenuContext);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
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
    <Box ref={mergedRef} onContextMenu={handleContextMenu} {...props}>
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
    context?.isOpen || false
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
      data-rnx-overlay="true"
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
    document.body
  );
};

export const ContextMenuContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const context = useContext(ContextMenuContext);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (context?.isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 150);
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
    slot
  );
});
ContextMenuContent.displayName = "ContextMenuContent";

export const ContextMenuItem = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; disabled?: boolean }
>(({ className, inset, disabled, ...props }, ref) => {
  const context = useContext(ContextMenuContext);
  return (
    <Box
      ref={ref}
      role="menuitem"
      onClick={(e) => {
        if (disabled) return;
        if (props.onClick) props.onClick(e);
        context?.setIsOpen(false);
      }}
      className={cn("rnx-dropdown-item", inset && "pl-8", className)}
      data-disabled={disabled}
      {...props}
    />
  );
});
ContextMenuItem.displayName = "ContextMenuItem";

export const ContextMenuCheckboxItem = forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "onCheckedChange"> & {
    checked?: boolean;
    disabled?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }
>(
  (
    { className, children, checked, disabled, onCheckedChange, ...props },
    ref
  ) => {
    const context = useContext(ContextMenuContext);
    return (
      <Box
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={checked}
        onClick={(e) => {
          if (disabled) return;
          if (props.onClick) props.onClick(e);
          if (onCheckedChange) onCheckedChange(!checked);
          context?.setIsOpen(false);
        }}
        className={cn("rnx-dropdown-item pl-8", className)}
        data-disabled={disabled}
        {...props}
      >
        <Box
          as="span"
          className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
        >
          {checked && <Check className="h-4 w-4" />}
        </Box>
        {children}
      </Box>
    );
  }
);
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export const ContextMenuRadioItem = forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "value"> & {
    value: string;
    checked?: boolean;
    disabled?: boolean;
  }
>(({ className, children, value, checked, disabled, ...props }, ref) => {
  const context = useContext(ContextMenuContext);
  return (
    <Box
      ref={ref}
      role="menuitemradio"
      aria-checked={checked}
      onClick={(e) => {
        if (disabled) return;
        if (props.onClick) props.onClick(e);
        context?.setIsOpen(false);
      }}
      className={cn("rnx-dropdown-item pl-8", className)}
      data-disabled={disabled}
      {...props}
    >
      <Box
        as="span"
        className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
      >
        {checked && <Circle className="h-2 w-2 fill-current" />}
      </Box>
      {children}
    </Box>
  );
});
ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export const ContextMenuLabel = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn("rnx-dropdown-label", inset && "pl-8", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = "ContextMenuLabel";

export const ContextMenuSeparator = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    role="separator"
    className={cn("rnx-dropdown-divider", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <Box
    as="span"
    className={cn(
      "text-muted-foreground ml-auto text-xs tracking-widest",
      className
    )}
    {...props}
  />
);
ContextMenuShortcut.displayName = "ContextMenuShortcut";

// Dummy components to preserve export API without adding complexity for nested sub-menus right now
export const ContextMenuGroup = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
export const ContextMenuSub = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
export const ContextMenuSubTrigger = ContextMenuItem;
export const ContextMenuSubContent = React.forwardRef<
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
ContextMenuSubContent.displayName = "ContextMenuSubContent";
export const ContextMenuRadioGroup = ({
  children,
  value,
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
            checked: element.props.value === value,
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
