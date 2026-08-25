"use client";
import React, { useState, useRef, useEffect, forwardRef, useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";
import { useFloatingPosition } from "../../hooks";
import { withLoading } from "../../utils/withLoading";
import "./Tooltip.css";

/**
 * A floating label that appears on hover or focus to provide additional context for an element.
 */
export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: "solid" | "glass" | "subtle" | "inverted";
  size?: "sm" | "md" | "lg";
  showArrow?: boolean;
  delay?: number;
  className?: string;
  position?: "top" | "right" | "bottom" | "left";
  /**
   * Controlled open state. When provided, hover/focus toggles are routed
   * through `onOpenChange` instead of internal state.
   */
  open?: boolean;
  /** Called when the open state should change (controlled mode). */
  onOpenChange?: (open: boolean) => void;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /**
   * Element to portal the tooltip into. Defaults to `document.body`.
   * Useful for tests or rendering inside a specific container.
   */
  container?: HTMLElement;
}

const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
TooltipProvider.displayName = "Tooltip.Provider";

const TooltipRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
TooltipRoot.displayName = "Tooltip.Root";

const TooltipTrigger: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
TooltipTrigger.displayName = "Tooltip.Trigger";

const TooltipContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
TooltipContent.displayName = "Tooltip.Content";

const TooltipBase = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      children,
      variant = "solid",
      size = "md",
      showArrow = false,
      delay = 200,
      className,
      position = "top",
      open: openProp,
      onOpenChange,
      defaultOpen = false,
      container,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const isOpen = isControlled ? openProp : internalOpen;
    const setIsOpen = React.useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const tooltipId = useId();

    const triggerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const floatingPos = useFloatingPosition(
      triggerRef,
      contentRef,
      isOpen,
      4,
      shouldRender,
      position,
      "center",
    );

    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, delay);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsOpen(false);
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          setIsOpen(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
      if (isOpen) {
        setMounted(true);
        setShouldRender(true);
      } else {
        setMounted(false);
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, 150);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    const triggerElement = React.isValidElement(children) ? (
      React.cloneElement(children as React.ReactElement<any>, {
        ref: (node: HTMLElement) => {
          (triggerRef as React.MutableRefObject<HTMLElement | null>).current =
            node;
          const childRef = (children as any).ref;
          if (typeof childRef === "function") childRef(node);
          else if (childRef) childRef.current = node;
        },
        onMouseEnter: (e: React.MouseEvent) => {
          handleMouseEnter();
          if ((children as React.ReactElement<any>).props.onMouseEnter) {
            (children as React.ReactElement<any>).props.onMouseEnter(e);
          }
        },
        onMouseLeave: (e: React.MouseEvent) => {
          handleMouseLeave();
          if ((children as React.ReactElement<any>).props.onMouseLeave) {
            (children as React.ReactElement<any>).props.onMouseLeave(e);
          }
        },
        onFocus: (e: React.FocusEvent) => {
          handleMouseEnter();
          if ((children as React.ReactElement<any>).props.onFocus) {
            (children as React.ReactElement<any>).props.onFocus(e);
          }
        },
        onBlur: (e: React.FocusEvent) => {
          handleMouseLeave();
          if ((children as React.ReactElement<any>).props.onBlur) {
            (children as React.ReactElement<any>).props.onBlur(e);
          }
        },
        "aria-describedby": isOpen ? tooltipId : undefined,
      })
    ) : (
      <Box
        as="span"
        ref={triggerRef as React.Ref<HTMLElement>}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-describedby={isOpen ? tooltipId : undefined}
      >
        {children}
      </Box>
    );

    const renderContent = () => {
      if (!shouldRender || typeof document === "undefined") return null;

      return createPortal(
        <Box
          ref={(node: HTMLDivElement) => {
            contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref)
              (ref as React.MutableRefObject<HTMLDivElement | null>).current =
                node;
          }}
          id={tooltipId}
          role="tooltip"
          className={cn(
            "rnx-tooltip-content",
            `rnx-tooltip-content--variant-${variant}`,
            `rnx-tooltip-content--size-${size}`,
            className,
          )}
          data-state={mounted ? "open" : "closed"}
          data-side={floatingPos?.placed ?? "bottom"}
          style={{
            top: floatingPos?.top ?? -9999,
            left: floatingPos?.left ?? -9999,
            visibility: floatingPos ? "visible" : "hidden",
          }}
          {...rnx({
            component: "Tooltip",
            state: isOpen ? "open" : "closed",
            overlay: true,
          })}
          {...props}
        >
          {showArrow && (
            <span
              className="rnx-tooltip-arrow"
              style={{
                top: floatingPos?.placed === "bottom" ? -3 : undefined,
                bottom: floatingPos?.placed === "top" ? -3 : undefined,
                left: floatingPos?.placed === "right" ? -3 : "calc(50% - 3px)",
                right: floatingPos?.placed === "left" ? -3 : undefined,
              }}
            />
          )}
          {content}
        </Box>,
        container ?? document.body,
      );
    };

    return (
      <>
        {triggerElement}
        {renderContent()}
      </>
    );
  },
);
TooltipBase.displayName = "Tooltip";
const TooltipWithLoading = withLoading(TooltipBase);

export const Tooltip = Object.assign(TooltipWithLoading, {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});
