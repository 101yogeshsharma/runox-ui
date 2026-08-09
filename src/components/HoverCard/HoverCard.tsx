"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { useFloatingPosition, useControllableState } from "../../hooks";
import { Box } from "../../atoms/Box";
import { Card } from "../Card";
// Uses: Card

export interface HoverCardProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  sideOffset?: number;
  openDelay?: number;
  closeDelay?: number;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  trigger,
  children,
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
    align === "left" ? "start" : align === "right" ? "end" : "center"
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
        id={contentId}
        ref={contentRef}
        role="dialog"
        variant="glass"
        size="sm"
        className={cn("rnx-hover-card-content", className)}
        data-state={mounted ? "open" : "closed"}
        data-side={position?.placed ?? "bottom"}
        data-rnx-overlay="true"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "absolute",
          zIndex: 50,
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          visibility: position ? "visible" : "hidden",
        }}
      >
        {children}
      </Card>,
      document.body
    );
  };

  return (
    <>
      {triggerElement}
      {renderContent()}
    </>
  );
};
