"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { Button, buttonVariants } from "../Button/Button";
// Uses: Button
import {
  useClickOutside,
  useFocusTrap,
  useControllableState,
} from "../../hooks";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Text } from "../../atoms/Text";
import { Box } from "../../atoms/Box";
import "./AlertDialog.css";
import { useTheme } from "../ThemeProvider/ThemeProvider";

const AlertDialogContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}>({
  isOpen: false,
  setIsOpen: () => {},
  titleId: "",
  descriptionId: "",
});

export interface AlertDialogProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AlertDialogComponent: React.FC<AlertDialogProps> = ({
  children,
  defaultOpen,
  open,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: defaultOpen || false,
    onChange: onOpenChange,
  });

  const rawId = React.useId();
  const idPrefix = `alert-${rawId.replace(/:/g, "")}`;
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-desc`;

  return (
    <AlertDialogContext.Provider
      value={{ isOpen: !!isOpen, setIsOpen, titleId, descriptionId }}
    >
      {children}
    </AlertDialogContext.Provider>
  );
};

AlertDialogComponent.displayName = "AlertDialog";

export interface AlertDialogTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  asChild?: boolean;
}

export const AlertDialogTrigger = forwardRef<
  HTMLButtonElement,
  AlertDialogTriggerProps
>(({ children, onClick, asChild, className, ...props }, ref) => {
  const { isOpen, setIsOpen } = useContext(AlertDialogContext);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    setIsOpen(!isOpen);
    onClick?.(e as React.MouseEvent<HTMLButtonElement>);
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        onClick?: React.MouseEventHandler<HTMLElement>;
      }>;
      if (child.props.onClick) child.props.onClick(e);
    }
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: React.MouseEventHandler<HTMLElement>;
    }>;
    return React.cloneElement(child, {
      ...props,
      ref: (node: HTMLButtonElement) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;

        const childRef = (
          child as unknown as { ref: React.Ref<HTMLButtonElement> }
        ).ref;
        if (typeof childRef === "function") childRef(node);
        else if (childRef)
          (
            childRef as React.MutableRefObject<HTMLButtonElement | null>
          ).current = node;
      },
      onClick: handleClick,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
});
AlertDialogTrigger.displayName = "AlertDialogTrigger";

export const AlertDialogContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { config } = useTheme();
  const { isOpen, setIsOpen, titleId, descriptionId } =
    useContext(AlertDialogContext);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const mergedRef = (node: HTMLDivElement) => {
    contentRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref)
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  useClickOutside(contentRef, () => {
    // AlertDialog should NOT close on outside click by default for accessibility,
    // but to match Radix we can keep it or let user provide onCancel
    // Actually, standard alert dialogs force user to click an action. Let's not close on outside click.
  });

  useFocusTrap(contentRef, isOpen);
  useScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setMounted(true);
      setShouldRender(true);
    } else {
      setMounted(false);
      timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  if (!shouldRender || typeof document === "undefined") return null;

  return createPortal(
    <Box
      className="rnx-alert-dialog-overlay"
      data-state={mounted ? "open" : "closed"}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <Box
        ref={mergedRef}
        className={cn(
          "rnx-alert-dialog-content",
          `rounded-${config.radius}`,
          className
        )}
        data-state={mounted ? "open" : "closed"}
        {...props}
      >
        {children}
      </Box>
    </Box>,
    document.body
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

export const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <Box className={cn("rnx-alert-dialog-header", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

export const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <Box className={cn("rnx-alert-dialog-footer", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

export const AlertDialogTitle = forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">
>(({ className, ...props }, ref) => {
  const { titleId } = useContext(AlertDialogContext);
  return (
    <Text
      as="h2"
      variant="h2"
      ref={ref}
      id={titleId}
      className={cn("rnx-alert-dialog-title", className)}
      {...props}
    />
  );
});
AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = forwardRef<
  HTMLParagraphElement,
  Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">
>(({ className, ...props }, ref) => {
  const { descriptionId } = useContext(AlertDialogContext);
  return (
    <Text
      as="p"
      variant="body"
      ref={ref}
      id={descriptionId}
      className={cn("rnx-alert-dialog-description", className)}
      {...props}
    />
  );
});
AlertDialogDescription.displayName = "AlertDialogDescription";

export interface AlertDialogActionProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  asChild?: boolean;
}

export const AlertDialogAction = forwardRef<
  HTMLButtonElement,
  AlertDialogActionProps
>(({ className, onClick, asChild, children, ...props }, ref) => {
  const { setIsOpen } = useContext(AlertDialogContext);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    setIsOpen(false);
    onClick?.(e as React.MouseEvent<HTMLButtonElement>);
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        onClick?: React.MouseEventHandler<HTMLElement>;
      }>;
      if (child.props.onClick) child.props.onClick(e);
    }
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: React.MouseEventHandler<HTMLElement>;
      className?: string;
    }>;
    return React.cloneElement(child, {
      ...props,
      className: cn(
        buttonVariants({ variant: "solid", color: "danger" }),
        className,
        child.props.className
      ),
      ref: (node: HTMLButtonElement) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
        const childRef = (
          child as unknown as { ref: React.Ref<HTMLButtonElement> }
        ).ref;
        if (typeof childRef === "function") childRef(node);
        else if (childRef)
          (
            childRef as React.MutableRefObject<HTMLButtonElement | null>
          ).current = node;
      },
      onClick: handleClick,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <Button
      ref={ref}
      onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
      variant="solid"
      color="danger"
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
});
AlertDialogAction.displayName = "AlertDialogAction";

export interface AlertDialogCancelProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  asChild?: boolean;
}

export const AlertDialogCancel = forwardRef<
  HTMLButtonElement,
  AlertDialogCancelProps
>(({ className, onClick, asChild, children, ...props }, ref) => {
  const { setIsOpen } = useContext(AlertDialogContext);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    setIsOpen(false);
    onClick?.(e as React.MouseEvent<HTMLButtonElement>);
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        onClick?: React.MouseEventHandler<HTMLElement>;
      }>;
      if (child.props.onClick) child.props.onClick(e);
    }
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: React.MouseEventHandler<HTMLElement>;
      className?: string;
    }>;
    return React.cloneElement(child, {
      ...props,
      className: cn(
        buttonVariants({ variant: "outline", color: "default" }),
        "rnx-alert-dialog-cancel",
        className,
        child.props.className
      ),
      ref: (node: HTMLButtonElement) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
        const childRef = (
          child as unknown as { ref: React.Ref<HTMLButtonElement> }
        ).ref;
        if (typeof childRef === "function") childRef(node);
        else if (childRef)
          (
            childRef as React.MutableRefObject<HTMLButtonElement | null>
          ).current = node;
      },
      onClick: handleClick,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <Button
      ref={ref}
      onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
      variant="outline"
      className={cn("rnx-alert-dialog-cancel", className)}
      {...props}
    >
      {children}
    </Button>
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

// Dummy components to match API
export const AlertDialogPortal = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;
export const AlertDialogOverlay = () => null;

export const AlertDialog = Object.assign(AlertDialogComponent, {
  Trigger: AlertDialogTrigger,
  Content: AlertDialogContent,
  Header: AlertDialogHeader,
  Footer: AlertDialogFooter,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Action: AlertDialogAction,
  Cancel: AlertDialogCancel,
  Portal: AlertDialogPortal,
  Overlay: AlertDialogOverlay,
});
