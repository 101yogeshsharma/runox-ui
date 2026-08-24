"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { useFloatingPosition, useControllableState } from "../../hooks";
import { Box } from "../../atoms/Box";
import { Card } from "../Card";
import { rnx } from "../../utils/rnx";
// Uses: Card

import "./HoverCard.css";

/**
 * Props for the HoverCard component.
 */
export interface HoverCardProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  variant?: "solid" | "glass";
  size?: "sm" | "md" | "lg";
  showArrow?: boolean;
  align?: "left" | "right" | "center";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  sideOffset?: number;
  openDelay?: number;
  closeDelay?: number;
}

const HoverCardComponent: React.FC<HoverCardProps> = ({
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
  openDelay = 200,
  closeDelay = 200,
}) => {
  const [isOpen, setIsOpen] = useControllableState({
    prop: isOpenProp,
    defaultProp: false,
    onChange: onOpenChange,
  });

  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const rawId = React.useId();
  const contentId = `hovercard-${rawId.replace(/:/g, "")}`;

  const position = useFloatingPosition(
    triggerRef,
    contentRef,
    isOpen,
    sideOffset,
    shouldRender,
    "bottom",
    align === "left" ? "start" : align === "right" ? "end" : "center",
  );

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, openDelay);
  };

  const handleMouseLeave = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
  };

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

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

  const triggerElement = React.isValidElement(trigger) ? (
    React.cloneElement(trigger as React.ReactElement<any>, {
      ref: (node: HTMLElement) => {
        (triggerRef as React.MutableRefObject<HTMLElement | null>).current =
          node;
        const childRef = (trigger as any).ref;
        if (typeof childRef === "function") childRef(node);
        else if (childRef) childRef.current = node;
      },
      onMouseEnter: (e: React.MouseEvent) => {
        handleMouseEnter();
        if ((trigger as React.ReactElement<any>).props.onMouseEnter) {
          (trigger as React.ReactElement<any>).props.onMouseEnter(e);
        }
      },
      onMouseLeave: (e: React.MouseEvent) => {
        handleMouseLeave();
        if ((trigger as React.ReactElement<any>).props.onMouseLeave) {
          (trigger as React.ReactElement<any>).props.onMouseLeave(e);
        }
      },
      onFocus: (e: React.FocusEvent) => {
        handleMouseEnter();
        if ((trigger as React.ReactElement<any>).props.onFocus) {
          (trigger as React.ReactElement<any>).props.onFocus(e);
        }
      },
      onBlur: (e: React.FocusEvent) => {
        handleMouseLeave();
        if ((trigger as React.ReactElement<any>).props.onBlur) {
          (trigger as React.ReactElement<any>).props.onBlur(e);
        }
      },
      "aria-expanded": isOpen,
      "aria-haspopup": "dialog",
      "aria-describedby": isOpen ? contentId : undefined,
    })
  ) : (
    <Box
      as="span"
      ref={triggerRef as React.Ref<HTMLElement>}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {trigger}
    </Box>
  );

  const renderContent = () => {
    if (!shouldRender || typeof document === "undefined") return null;

    return createPortal(
      <Card
        {...rnx({ component: "HoverCard", state: "open" })}
        id={contentId}
        ref={contentRef}
        role="dialog"
        variant={variant as any}
        size={size as any}
        className={cn(
          "rnx-hover-card-content",
          `rnx-hover-card-content--variant-${variant}`,
          `rnx-hover-card-content--${size}`,
          className,
        )}
        data-state={mounted ? "open" : "closed"}
        data-side={position?.placed ?? "bottom"}
        data-rnx-overlay="true"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "absolute",
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          visibility: position ? "visible" : "hidden",
        }}
      >
        {showArrow && (
          <span
            className="rnx-hover-card-arrow"
            style={{
              top: position?.placed === "bottom" ? -4 : undefined,
              bottom: position?.placed === "top" ? -4 : undefined,
              left: position?.placed === "right" ? -4 : "calc(50% - 4px)",
              right: position?.placed === "left" ? -4 : undefined,
            }}
          />
        )}
        {children}
      </Card>,
      document.body,
    );
  };

  return (
    <>
      {triggerElement}
      {renderContent()}
    </>
  );
};
HoverCardComponent.displayName = "HoverCard";

export const HoverCardTrigger: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
HoverCardTrigger.displayName = "HoverCard.Trigger";

export const HoverCardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => <span className={className}>{children}</span>;
HoverCardContent.displayName = "HoverCard.Content";

export const HoverCard = Object.assign(HoverCardComponent, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
});
