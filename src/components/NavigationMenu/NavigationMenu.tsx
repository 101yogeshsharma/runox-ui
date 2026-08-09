"use client";
import "./NavigationMenu.css";
import { Box } from "../../atoms/Box";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Circle } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { useTheme } from "../ThemeProvider/ThemeProvider";
import {
  useFloatingPosition,
  useClickOutside,
  useFocusTrap,
} from "../../hooks";

type NavigationMenuVariant = "navigation" | "menubar";

type NavigationMenuContextValue = {
  activeValue: string | null;
  setActiveValue: (val: string | null) => void;
  variant: NavigationMenuVariant;
  menuId: string;
};

const NavigationMenuContext = createContext<NavigationMenuContextValue>({
  activeValue: null,
  setActiveValue: () => {},
  variant: "navigation",
  menuId: "",
});

type NavigationMenuItemContextValue = {
  value: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  setTriggerRef: (node: HTMLElement | null) => void;
};
const NavigationMenuItemContext = createContext<NavigationMenuItemContextValue>(
  {
    value: "",
    triggerRef: { current: null },
    setTriggerRef: () => {},
  }
);

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: NavigationMenuVariant;
}

const NavigationMenu = React.forwardRef<HTMLDivElement, NavigationMenuProps>(
  ({ className, variant = "navigation", children, ...props }, ref) => {
    const { config } = useTheme();
    const [activeValue, setActiveValue] = useState<string | null>(null);
    const menuId = React.useId().replace(/:/g, "");
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const mergedRef = (node: HTMLDivElement) => {
      containerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    useClickOutside(containerRef, () => setActiveValue(null));

    const handleMouseLeave = () => {
      if (variant === "navigation") {
        timeoutRef.current = setTimeout(() => {
          setActiveValue(null);
        }, 150);
      }
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const isMenubar = variant === "menubar";
    const _Tag = isMenubar ? "div" : "nav";

    return (
      <NavigationMenuContext.Provider
        value={{ activeValue, setActiveValue, variant, menuId }}
      >
        <Box
          as={isMenubar ? "div" : "nav"}
          ref={mergedRef}
          role={isMenubar ? "menubar" : "navigation"}
          className={cn(
            `rounded-${config.radius}`,
            isMenubar
              ? "border-border/40 bg-background/70 flex h-12 items-center space-x-1 border px-2 py-1.5 shadow-sm backdrop-blur-xl transition-all duration-300"
              : "relative z-10 flex max-w-max flex-1 items-center justify-center",
            className
          )}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          {...props}
        >
          {children}
        </Box>
      </NavigationMenuContext.Provider>
    );
  }
);
NavigationMenu.displayName = "NavigationMenu";

const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  const { variant } = useContext(NavigationMenuContext);
  const isMenubar = variant === "menubar";
  const _Tag = isMenubar ? "div" : "ul";

  return (
    <Box
      as={isMenubar ? "div" : "ul"}
      ref={ref}
      className={cn(
        !isMenubar &&
          "group relative flex flex-1 list-none items-center justify-center space-x-1",
        isMenubar && "flex items-center space-x-1",
        className
      )}
      {...props}
    />
  );
});
NavigationMenuList.displayName = "NavigationMenuList";

const NavigationMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & { value?: string }
>(({ className, value, children, ...props }, ref) => {
  const id = React.useId();
  const itemValue = value || id;
  const { variant } = useContext(NavigationMenuContext);
  const isMenubar = variant === "menubar";
  const _Tag = isMenubar ? "div" : "li";
  const triggerRef = useRef<HTMLElement | null>(null);
  const setTriggerRef = (node: HTMLElement | null) => {
    triggerRef.current = node;
  };

  return (
    <NavigationMenuItemContext.Provider
      value={{ value: itemValue, triggerRef, setTriggerRef }}
    >
      <Box
        as={isMenubar ? "div" : "li"}
        ref={ref}
        className={cn(!isMenubar && "relative", className)}
        {...props}
      >
        {children}
      </Box>
    </NavigationMenuItemContext.Provider>
  );
});
NavigationMenuItem.displayName = "NavigationMenuItem";

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent/80 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent data-[state=open]:shadow-sm"
);

const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, onMouseEnter, ...props }, ref) => {
  const { activeValue, setActiveValue, variant } = useContext(
    NavigationMenuContext
  );
  const { value, setTriggerRef } = useContext(NavigationMenuItemContext);
  const isOpen = activeValue === value;
  const isMenubar = variant === "menubar";

  return (
    <button
      ref={(node) => {
        setTriggerRef(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        isMenubar
          ? "focus:bg-accent focus:text-accent-foreground hover:bg-accent/80 hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-pointer items-center rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 outline-none select-none data-[state=open]:shadow-sm"
          : navigationMenuTriggerStyle(),
        !isMenubar && "group",
        className
      )}
      onClick={(e) => {
        setActiveValue(isOpen ? null : value);
        onClick?.(e);
      }}
      onMouseEnter={(e) => {
        if (isMenubar) {
          if (activeValue !== null && activeValue !== value) {
            setActiveValue(value);
          }
        } else {
          setActiveValue(value);
        }
        onMouseEnter?.(e);
      }}
      {...props}
    >
      {children}
      {!isMenubar && (
        <ChevronDown
          className="rnx-nav-menu__chevron relative ms-1 h-3.5 w-3.5 opacity-70 transition duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
    </button>
  );
});
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }
>(({ className, align = "start", children, ...props }, ref) => {
  const { activeValue, variant } = useContext(NavigationMenuContext);
  const { value, triggerRef } = useContext(NavigationMenuItemContext);
  const isOpen = activeValue === value;
  const isMenubar = variant === "menubar";

  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const position = useFloatingPosition(
    triggerRef,
    contentRef,
    isOpen,
    isMenubar ? 4 : 8,
    mounted,
    "bottom",
    align
  );

  useFocusTrap(contentRef, isOpen);

  const mergedRef = (node: HTMLDivElement) => {
    contentRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <Box
      ref={mergedRef}
      role="menu"
      data-state={isOpen ? "open" : "closed"}
      data-rnx-overlay="true"
      className={cn(
        "rnx-dropdown-content border-border/50 bg-background/95 text-popover-foreground animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 z-[var(--z-dropdown)] min-w-56 origin-top overflow-hidden rounded-xl border p-1.5 shadow-xl backdrop-blur-xl",
        className
      )}
      style={{
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        visibility: position ? "visible" : "hidden",
        position: "absolute",
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const items = Array.from(
            e.currentTarget.querySelectorAll(
              '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'
            )
          ).filter((el) => !el.hasAttribute("disabled"));
          if (!items.length) return;
          const idx = items.indexOf(document.activeElement as Element);
          let next;
          if (idx === -1) {
            next = items[e.key === "ArrowDown" ? 0 : items.length - 1];
          } else {
            next =
              e.key === "ArrowDown"
                ? items[(idx + 1) % items.length]
                : items[(idx - 1 + items.length) % items.length];
          }
          (next as HTMLElement)?.focus();
        }
        props.onKeyDown?.(e);
      }}
      {...props}
    >
      {children}
    </Box>,
    document.body
  );
});
NavigationMenuContent.displayName = "NavigationMenuContent";

const NavigationMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }
>(({ className, active, ...props }, ref) => (
  <a
    ref={ref}
    data-active={active ? "" : undefined}
    className={cn(
      "hover:bg-accent/80 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-xl p-3 leading-none no-underline transition-all duration-200 outline-none select-none",
      className
    )}
    {...props}
  />
));
NavigationMenuLink.displayName = "NavigationMenuLink";

const NavigationMenuDropdownItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { inset?: boolean }
>(({ className, inset, onClick, ...props }, ref) => {
  const { setActiveValue } = useContext(NavigationMenuContext);
  return (
    <button
      ref={ref}
      role="menuitem"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50",
        inset && "ps-8",
        className
      )}
      onClick={(e) => {
        setActiveValue(null);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
NavigationMenuDropdownItem.displayName = "NavigationMenuDropdownItem";

const NavigationMenuCheckboxItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean }
>(({ className, children, checked, onClick, ...props }, ref) => {
  return (
    <button
      ref={ref}
      role="menuitemcheckbox"
      aria-checked={checked}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-pointer items-center rounded-lg py-2 ps-9 pe-3 text-sm transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
      }}
      {...props}
    >
      <Box
        as="span"
        className="absolute start-3 flex h-4 w-4 items-center justify-center"
      >
        {checked && <Check className="h-4 w-4" />}
      </Box>
      {children}
    </button>
  );
});
NavigationMenuCheckboxItem.displayName = "NavigationMenuCheckboxItem";

const NavigationMenuRadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, ...props }, ref) => (
  <Box ref={ref} role="group" className={className} {...props} />
));
NavigationMenuRadioGroup.displayName = "NavigationMenuRadioGroup";

const NavigationMenuRadioItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
    checked?: boolean;
  }
>(({ className, children, checked, onClick, ...props }, ref) => {
  return (
    <button
      ref={ref}
      role="menuitemradio"
      aria-checked={checked}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-pointer items-center rounded-lg py-2 ps-9 pe-3 text-sm transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
      }}
      {...props}
    >
      <Box
        as="span"
        className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center"
      >
        {checked && <Circle className="h-2 w-2 fill-current" />}
      </Box>
      {children}
    </button>
  );
});
NavigationMenuRadioItem.displayName = "NavigationMenuRadioItem";

const NavigationMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <Box
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "ps-8",
      className
    )}
    {...props}
  />
));
NavigationMenuLabel.displayName = "NavigationMenuLabel";

const NavigationMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box
    ref={ref}
    role="separator"
    className={cn("bg-muted -mx-1 my-1 h-px", className)}
    {...props}
  />
));
NavigationMenuSeparator.displayName = "NavigationMenuSeparator";

const NavigationMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <Box
      as="span"
      className={cn(
        "text-muted-foreground ms-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  );
};
NavigationMenuShortcut.displayName = "NavigationMenuShortcut";

const NavigationMenuViewport = () => null;
const NavigationMenuIndicator = () => null;
const NavigationMenuSub = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const NavigationMenuSubTrigger = NavigationMenuDropdownItem;
const NavigationMenuSubContent = NavigationMenuContent;
const NavigationMenuGroup = NavigationMenuRadioGroup;
const NavigationMenuPortal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  NavigationMenuDropdownItem,
  NavigationMenuCheckboxItem,
  NavigationMenuRadioGroup,
  NavigationMenuRadioItem,
  NavigationMenuLabel,
  NavigationMenuSeparator,
  NavigationMenuShortcut,
  NavigationMenuSub,
  NavigationMenuSubTrigger,
  NavigationMenuSubContent,
  NavigationMenuGroup,
  NavigationMenuPortal,
};

export const Menubar = (props: Omit<NavigationMenuProps, "variant">) => (
  <NavigationMenu variant="menubar" {...props} />
);
export const MenubarMenu = NavigationMenuItem;
export const MenubarTrigger = NavigationMenuTrigger;
export const MenubarContent = NavigationMenuContent;
export const MenubarItem = NavigationMenuDropdownItem;
export const MenubarSeparator = NavigationMenuSeparator;
export const MenubarLabel = NavigationMenuLabel;
export const MenubarCheckboxItem = NavigationMenuCheckboxItem;
export const MenubarRadioGroup = NavigationMenuRadioGroup;
export const MenubarRadioItem = NavigationMenuRadioItem;
export const MenubarPortal = NavigationMenuPortal;
export const MenubarSubContent = NavigationMenuSubContent;
export const MenubarSubTrigger = NavigationMenuSubTrigger;
export const MenubarGroup = NavigationMenuGroup;
export const MenubarSub = NavigationMenuSub;
export const MenubarShortcut = NavigationMenuShortcut;
