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
import { NAVIGATION_MENU_EXIT_DURATION_MS } from "../../internal/timings";
import { useFloatingPosition, useClickOutside } from "../../hooks";
import { rnx } from "../../utils/rnx";

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
  },
);

/**
 * Props for the NavigationMenu component.
 */
export interface NavigationMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: NavigationMenuVariant;
  label?: string;
}

const NavigationMenu = React.forwardRef<HTMLDivElement, NavigationMenuProps>(
  ({ className, variant = "navigation", label, children, ...props }, ref) => {
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

    return (
      <NavigationMenuContext.Provider
        value={{ activeValue, setActiveValue, variant, menuId }}
      >
        <Box
          {...rnx({ component: "NavigationMenu" })}
          as={isMenubar ? "div" : "nav"}
          ref={mergedRef}
          role={isMenubar ? "menubar" : "navigation"}
          aria-label={
            label ||
            props["aria-label"] ||
            (isMenubar ? "Menu bar" : "Main navigation")
          }
          className={cn(
            isMenubar ? "rnx-navigation-menu--menubar" : "rnx-navigation-menu",
            className,
          )}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          {...props}
        >
          {children}
        </Box>
      </NavigationMenuContext.Provider>
    );
  },
);
NavigationMenu.displayName = "NavigationMenu";

const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  const { variant } = useContext(NavigationMenuContext);
  const isMenubar = variant === "menubar";

  return (
    <Box
      as={isMenubar ? "div" : "ul"}
      ref={ref}
      className={cn("rnx-navigation-menu-list", className)}
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
        className={cn("rnx-navigation-menu-item", className)}
        {...props}
      >
        {children}
      </Box>
    </NavigationMenuItemContext.Provider>
  );
});
NavigationMenuItem.displayName = "NavigationMenuItem";

const navigationMenuTriggerStyle = cva("rnx-navigation-menu-trigger");

const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(
  (
    { className, children, onClick, onMouseEnter, onKeyDown, ...props },
    ref,
  ) => {
    const { activeValue, setActiveValue, variant, menuId } = useContext(
      NavigationMenuContext,
    );
    const { value, setTriggerRef } = useContext(NavigationMenuItemContext);
    const isOpen = activeValue === value;
    const isMenubar = variant === "menubar";
    const contentId = `rnx-navigation-menu-content-${menuId}-${value}`;

    return (
      <button
        ref={(node) => {
          setTriggerRef(node);
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        id={`rnx-navigation-menu-trigger-${menuId}-${value}`}
        role={isMenubar ? "menuitem" : undefined}
        aria-haspopup={isMenubar ? "menu" : undefined}
        aria-expanded={isOpen}
        aria-controls={contentId}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "rnx-navigation-menu-trigger",
          isMenubar && "rnx-navigation-menu-trigger--menubar",
          className,
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
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setActiveValue(isOpen ? null : value);
          }
          if (e.key === "Escape" && isOpen) {
            e.preventDefault();
            setActiveValue(null);
          }
        }}
        {...props}
      >
        {children}
        {!isMenubar && (
          <ChevronDown
            className="rnx-navigation-menu__chevron"
            aria-hidden="true"
          />
        )}
      </button>
    );
  },
);
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }
>(({ className, align = "start", children, onKeyDown, ...props }, ref) => {
  const { activeValue, setActiveValue, variant, menuId } = useContext(
    NavigationMenuContext,
  );
  const { value, triggerRef } = useContext(NavigationMenuItemContext);
  const isOpen = activeValue === value;
  const isMenubar = variant === "menubar";
  const contentId = `rnx-navigation-menu-content-${menuId}-${value}`;

  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(
        () => setMounted(false),
        NAVIGATION_MENU_EXIT_DURATION_MS,
      );
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
    align,
  );

  const mergedRef = (node: HTMLDivElement) => {
    contentRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <Box
      ref={mergedRef}
      id={contentId}
      role="menu"
      data-state={isOpen ? "open" : "closed"}
      className={cn("rnx-navigation-menu-content", className)}
      style={{
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        visibility: position ? "visible" : "hidden",
        position: "absolute",
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setActiveValue(null);
          triggerRef.current?.focus();
          return;
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const items = Array.from(
            e.currentTarget.querySelectorAll(
              '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]',
            ),
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
        onKeyDown?.(e);
      }}
      aria-labelledby={`rnx-navigation-menu-trigger-${menuId}-${value}`}
      {...props}
    >
      {children}
    </Box>,
    document.body,
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
    className={cn("rnx-navigation-menu-link", className)}
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
        "rnx-navigation-menu-dropdown-item",
        inset && "rnx-navigation-menu-dropdown-item--inset",
        className,
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
      className={cn("rnx-navigation-menu-checkbox-item", className)}
      onClick={(e) => {
        onClick?.(e);
      }}
      {...props}
    >
      <Box as="span" className="rnx-navigation-menu-indicator-icon">
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
      className={cn("rnx-navigation-menu-radio-item", className)}
      onClick={(e) => {
        onClick?.(e);
      }}
      {...props}
    >
      <Box as="span" className="rnx-navigation-menu-indicator-icon">
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
      "rnx-navigation-menu-label",
      inset && "rnx-navigation-menu-label--inset",
      className,
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
    className={cn("rnx-navigation-menu-separator", className)}
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
      className={cn("rnx-navigation-menu-shortcut", className)}
      {...props}
    />
  );
};
NavigationMenuShortcut.displayName = "NavigationMenuShortcut";

const NavigationMenuViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { activeValue } = useContext(NavigationMenuContext);
  return (
    <Box
      ref={ref}
      className={cn(
        "rnx-navigation-menu__viewport relative origin-top-center overflow-hidden transition-all duration-200",
        activeValue && "rnx-navigation-menu__viewport--open",
        className,
      )}
      {...props}
    />
  );
});
NavigationMenuViewport.displayName = "NavigationMenuViewport";

const NavigationMenuIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { activeValue } = useContext(NavigationMenuContext);
  if (!activeValue) return null;
  return (
    <Box
      ref={ref}
      className={cn(
        "rnx-navigation-menu__indicator top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden transition-all duration-200",
        className,
      )}
      {...props}
    >
      <Box className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </Box>
  );
});
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";

const NavigationMenuSub = ({ children }: { children: React.ReactNode }) => (
  <Box className="rnx-navigation-menu__sub relative">{children}</Box>
);
const NavigationMenuSubTrigger = NavigationMenuDropdownItem;
const NavigationMenuSubContent = NavigationMenuContent;
const NavigationMenuGroup = NavigationMenuRadioGroup;
const NavigationMenuPortal = ({ children }: { children: React.ReactNode }) => {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
};

const NavigationMenuNamespace = Object.assign(NavigationMenu, {
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Content: NavigationMenuContent,
  Trigger: NavigationMenuTrigger,
  Link: NavigationMenuLink,
  Indicator: NavigationMenuIndicator,
  Viewport: NavigationMenuViewport,
  DropdownItem: NavigationMenuDropdownItem,
  CheckboxItem: NavigationMenuCheckboxItem,
  RadioGroup: NavigationMenuRadioGroup,
  RadioItem: NavigationMenuRadioItem,
  Label: NavigationMenuLabel,
  Separator: NavigationMenuSeparator,
  Shortcut: NavigationMenuShortcut,
  Sub: NavigationMenuSub,
  SubTrigger: NavigationMenuSubTrigger,
  SubContent: NavigationMenuSubContent,
  Group: NavigationMenuGroup,
  Portal: NavigationMenuPortal,
});

export const MenubarRoot = (props: Omit<NavigationMenuProps, "variant">) => (
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

export const Menubar = Object.assign(MenubarRoot, {
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  Content: MenubarContent,
  Item: MenubarItem,
  Separator: MenubarSeparator,
  Label: MenubarLabel,
  CheckboxItem: MenubarCheckboxItem,
  RadioGroup: MenubarRadioGroup,
  RadioItem: MenubarRadioItem,
  Portal: MenubarPortal,
  SubContent: MenubarSubContent,
  SubTrigger: MenubarSubTrigger,
  Group: MenubarGroup,
  Sub: MenubarSub,
  Shortcut: MenubarShortcut,
});

export {
  navigationMenuTriggerStyle,
  NavigationMenuNamespace as NavigationMenu,
};
