"use client";
import React, { useState, useRef, useEffect, forwardRef, useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { Box } from "../../atoms/Box";
import { useFloatingPosition } from "../../hooks";
import { useTheme } from "../ThemeProvider/ThemeProvider";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  position?: "top" | "right" | "bottom" | "left";
}

// Keeping the original exports for API compatibility, but they are no-ops since we don't need Context Providers anymore
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
export const TooltipRoot: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
export const TooltipTrigger: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    { content, children, delay = 200, className, position = "top", ...props },
    ref
  ) => {
    const { config } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
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
      "center"
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
            `rounded-${config.radius}`,
            className
          )}
          data-state={mounted ? "open" : "closed"}
          data-side={floatingPos?.placed ?? "bottom"}
          data-rnx-overlay="true"
          style={{
            top: floatingPos?.top ?? -9999,
            left: floatingPos?.left ?? -9999,
            visibility: floatingPos ? "visible" : "hidden",
          }}
          {...props}
        >
          {content}
        </Box>,
        document.body
      );
    };

    return (
      <>
        {triggerElement}
        {renderContent()}
      </>
    );
  }
);
Tooltip.displayName = "Tooltip";
