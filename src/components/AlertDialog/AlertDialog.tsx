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
import { rnx } from "../../utils/rnx";
import { Button, buttonVariants } from "../Button/Button";
// Uses: Button
import { useFocusTrap, useControllableState } from "../../hooks";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Text } from "../../atoms/Text";
import { Box } from "../../atoms/Box";
import { warnInvalidProps } from "../../utils/warn";
import type { RnxColor } from "../../types";
import "./AlertDialog.css";

const AlertDialogContentContext = createContext<boolean>(false);

const AlertDialogContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  dismissible: boolean;
  container?: HTMLElement;
}>({
  isOpen: false,
  setIsOpen: () => {},
  titleId: "",
  descriptionId: "",
  dismissible: false,
});

/**
 * Props for the AlertDialog component.
 */
export interface AlertDialogProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Element to portal into. Defaults to document.body.
   */
  container?: HTMLElement;
  /**
   * Allow closing via Escape. Defaults to false per the WAI-ARIA alertdialog
   * pattern (dismissal requires an explicit action).
   */
  dismissible?: boolean;
}

const AlertDialogComponent = React.forwardRef<HTMLDivElement, AlertDialogProps>(
  (
    {
      children,
      defaultOpen,
      open,
      onOpenChange,
      dismissible = false,
      container,
    },
    ref,
  ) => {
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
        value={{
          isOpen: !!isOpen,
          setIsOpen,
          titleId,
          descriptionId,
          dismissible,
          container,
        }}
      >
        <Box ref={ref}>{children}</Box>
      </AlertDialogContext.Provider>
    );
  },
);

AlertDialogComponent.displayName = "AlertDialog";

export interface AlertDialogTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  asChild?: boolean;
}

const AlertDialogTrigger = forwardRef<
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
AlertDialogTrigger.displayName = "AlertDialog.Trigger";

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "glass" | "danger";
  size?: "sm" | "md" | "lg";
}

const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ className, variant = "solid", size = "md", children, ...props }, ref) => {
    const {
      isOpen,
      setIsOpen,
      titleId,
      descriptionId,
      dismissible,
      container,
    } = useContext(AlertDialogContext);
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const mergedRef = (node: HTMLDivElement) => {
      contentRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    useFocusTrap(contentRef, isOpen && shouldRender);
    useScrollLock(isOpen);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // WAI-ARIA alertdialog: dismissal requires an explicit action. Escape
        // only closes when the consumer explicitly opts in with `dismissible`.
        if (e.key === "Escape" && dismissible && isOpen) {
          setIsOpen(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, setIsOpen, dismissible]);

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
        {...rnx({
          component: "AlertDialog",
          state: mounted ? "open" : "closed",
          overlay: true,
        })}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <Box
          ref={mergedRef}
          tabIndex={-1}
          {...rnx({ component: "AlertDialogContent", variant })}
          className={cn(
            "rnx-alert-dialog-content",
            `rnx-alert-dialog-content--variant-${variant}`,
            `rnx-alert-dialog-content--size-${size}`,
            className,
          )}
          data-state={mounted ? "open" : "closed"}
          {...props}
        >
          <AlertDialogContentContext.Provider value={true}>
            {children}
          </AlertDialogContentContext.Provider>
        </Box>
      </Box>,
      container ?? document.body,
    );
  },
);
AlertDialogContent.displayName = "AlertDialog.Content";

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isInContent = useContext(AlertDialogContentContext);
  if (!isInContent) {
    warnInvalidProps(
      "AlertDialog",
      "AlertDialog.Header should be rendered inside <AlertDialog.Content>.",
    );
  }
  return (
    <Box className={cn("rnx-alert-dialog-header", className)} {...props} />
  );
};
AlertDialogHeader.displayName = "AlertDialog.Header";

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isInContent = useContext(AlertDialogContentContext);
  if (!isInContent) {
    warnInvalidProps(
      "AlertDialog",
      "AlertDialog.Footer should be rendered inside <AlertDialog.Content>.",
    );
  }
  return (
    <Box className={cn("rnx-alert-dialog-footer", className)} {...props} />
  );
};
AlertDialogFooter.displayName = "AlertDialog.Footer";

const AlertDialogTitle = forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">
>(({ className, ...props }, ref) => {
  const { titleId } = useContext(AlertDialogContext);
  const isInContent = useContext(AlertDialogContentContext);
  if (!isInContent) {
    warnInvalidProps(
      "AlertDialog",
      "AlertDialog.Title should be rendered inside <AlertDialog.Content>.",
    );
  }
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
AlertDialogTitle.displayName = "AlertDialog.Title";

const AlertDialogDescription = forwardRef<
  HTMLParagraphElement,
  Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">
>(({ className, ...props }, ref) => {
  const { descriptionId } = useContext(AlertDialogContext);
  const isInContent = useContext(AlertDialogContentContext);
  if (!isInContent) {
    warnInvalidProps(
      "AlertDialog",
      "AlertDialog.Description should be rendered inside <AlertDialog.Content>.",
    );
  }
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
AlertDialogDescription.displayName = "AlertDialog.Description";

export interface AlertDialogActionProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  asChild?: boolean;
  variant?: "solid" | "outline" | "ghost" | "glass" | "icon" | "fab";
  color?: RnxColor;
}

const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  (
    {
      className,
      onClick,
      asChild,
      variant = "solid",
      color = "primary",
      children,
      ...props
    },
    ref,
  ) => {
    const { setIsOpen } = useContext(AlertDialogContext);
    const isInContent = useContext(AlertDialogContentContext);
    if (!isInContent) {
      warnInvalidProps(
        "AlertDialog",
        "AlertDialog.Action should be rendered inside <AlertDialog.Content>.",
      );
    }

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
          buttonVariants({ variant, color }),
          "rnx-alert-dialog-action",
          className,
          child.props.className,
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
        variant={variant}
        color={color}
        onClick={handleClick as React.MouseEventHandler<HTMLButtonElement>}
        className={cn("rnx-alert-dialog-action", className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
AlertDialogAction.displayName = "AlertDialog.Action";

export interface AlertDialogCancelProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  asChild?: boolean;
  variant?: "solid" | "outline" | "ghost" | "glass" | "icon" | "fab";
  color?: RnxColor;
}

const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  (
    {
      className,
      onClick,
      asChild,
      variant = "outline",
      color = "default",
      children,
      ...props
    },
    ref,
  ) => {
    const { setIsOpen } = useContext(AlertDialogContext);
    const isInContent = useContext(AlertDialogContentContext);
    if (!isInContent) {
      warnInvalidProps(
        "AlertDialog",
        "AlertDialog.Cancel should be rendered inside <AlertDialog.Content>.",
      );
    }

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
          buttonVariants({ variant, color }),
          "rnx-alert-dialog-cancel",
          className,
          child.props.className,
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
        variant={variant}
        color={color}
        className={cn("rnx-alert-dialog-cancel", className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
AlertDialogCancel.displayName = "AlertDialog.Cancel";

// Dummy components to match API
const AlertDialogPortal = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
AlertDialogPortal.displayName = "AlertDialog.Portal";
const AlertDialogOverlay = () => null;
AlertDialogOverlay.displayName = "AlertDialog.Overlay";

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
