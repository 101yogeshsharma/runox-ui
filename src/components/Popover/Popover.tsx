"use client";
import React, { useState, useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import {
  useFloatingPosition,
  useClickOutside,
  useControllableState,
} from "../../hooks";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";
import "./Popover.css";

/**
 * Props for the Popover component.
 */
export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  variant?: "solid" | "glass" | "tooltip";
  size?: "sm" | "md" | "lg";
  showArrow?: boolean;
  align?: "start" | "center" | "end";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  sideOffset?: number;
  style?: React.CSSProperties;
  matchTriggerWidth?: boolean;
}

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      trigger,
      children,
      variant = "glass",
      size = "md",
      showArrow = false,
      align = "center",
      isOpen: isOpenProp,
      onOpenChange,
      className,
      sideOffset = 4,
      style,
      matchTriggerWidth = false,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: isOpenProp,
      defaultProp: false,
      onChange: onOpenChange,
    });

    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [contentMounted, setContentMounted] = useState(false);
    const rawId = useId();
    const contentId = `rnx-popover-${rawId.replace(/:/g, "")}`;

    const triggerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergeRefs(contentRef, ref);

    const position = useFloatingPosition(
      triggerRef,
      contentRef,
      isOpen,
      sideOffset,
      contentMounted,
      "bottom",
      align,
    );

    // Close when clicking outside content (on the overlay)
    useClickOutside(contentRef, (e) => {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) {
        return;
      }
      if (isOpen) setIsOpen(false);
    });

    // Handle escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          setIsOpen(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, setIsOpen]);

    // Handle mounting and unmounting animations
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

    useEffect(() => {
      if (shouldRender) {
        requestAnimationFrame(() => setContentMounted(true));
      } else {
        setContentMounted(false);
      }
    }, [shouldRender]);

    const triggerElement = React.isValidElement(trigger) ? (
      React.cloneElement(trigger as React.ReactElement<any>, {
        ref: (node: HTMLElement) => {
          (triggerRef as React.MutableRefObject<HTMLElement | null>).current =
            node;
          const childRef = (trigger as any).ref;
          if (typeof childRef === "function") childRef(node);
          else if (childRef) childRef.current = node;
        },
        onClick: (e: React.MouseEvent) => {
          setIsOpen(!isOpen);
          if ((trigger as React.ReactElement<any>).props.onClick) {
            (trigger as React.ReactElement<any>).props.onClick(e);
          }
        },
        "aria-expanded": isOpen,
        "aria-haspopup": "dialog",
        "aria-controls": contentMounted ? contentId : undefined,
      })
    ) : (
      <Box
        as="span"
        ref={triggerRef as React.Ref<HTMLElement>}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </Box>
    );

    const renderContent = () => {
      if (!shouldRender || typeof document === "undefined") return null;

      let matchedWidth: number | undefined;

      if (position && triggerRef.current && contentRef.current) {
        const anchorRect = triggerRef.current.getBoundingClientRect();
        if (matchTriggerWidth) {
          matchedWidth = anchorRect.width;
        }
      }

      return createPortal(
        <Box
          ref={mergedRef}
          id={contentId}
          role="dialog"
          className={cn(
            "rnx-popover-content",
            `rnx-popover-content--variant-${variant}`,
            `rnx-popover-content--${size}`,
            className,
          )}
          data-state={mounted && position ? "open" : "closed"}
          data-side={position?.placed || "bottom"}
          data-rnx-overlay="true"
          style={{
            ...style,
            top: position?.top || 0,
            left: position?.left || 0,
            visibility: position ? "visible" : "hidden",
            width: matchTriggerWidth ? matchedWidth : style?.width,
          }}
          {...rnx({ component: "Popover", state: isOpen ? "open" : "closed" })}
        >
          {showArrow && (
            <span
              className="rnx-popover-arrow"
              style={{
                top: position?.placed === "bottom" ? -4 : undefined,
                bottom: position?.placed === "top" ? -4 : undefined,
                left: position?.placed === "right" ? -4 : "calc(50% - 4px)",
                right: position?.placed === "left" ? -4 : undefined,
              }}
            />
          )}
          {children}
        </Box>,
        document.body,
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

Popover.displayName = "Popover";
