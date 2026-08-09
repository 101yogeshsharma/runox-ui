"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box } from "../../atoms/Box";
import { Button } from "../Button";
// Uses: Button
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { useMakeWay } from "../Motion";
import { useClickOutside, useFocusTrap } from "../../hooks";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { useScrollLock } from "../../hooks/useScrollLock";

export interface ModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  children: React.ReactNode;
  hideCloseButton?: boolean;
  dismissible?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const ModalContext = React.createContext<{ titleId: string }>({ titleId: "" });

const ModalComponent = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      children,
      hideCloseButton = false,
      dismissible = true,
      size = "md",
      className,
    },
    ref
  ) => {
    const { registerModal, unregisterModal } = useMakeWay();
    const rawId = React.useId();
    const modalId = `modal-${rawId.replace(/:/g, "")}`;
    const titleId = `${modalId}-title`;
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergeRefs(contentRef, ref);

    // Close when clicking outside content (on the overlay)
    useClickOutside(contentRef, () => {
      if (dismissible && isOpen) onClose(false);
    });

    // Trap focus
    useFocusTrap(contentRef, isOpen);
    useScrollLock(isOpen);

    // Close on Escape
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && dismissible && isOpen) {
          onClose(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, dismissible]);

    // Handle mounting and unmounting animations
    useEffect(() => {
      if (isOpen) {
        setMounted(true);
        setShouldRender(true);
        registerModal(modalId);

        return () => {
          // Cleanup: always decrement when this open-state effect tears down
          unregisterModal(modalId);
        };
      } else {
        setMounted(false);
        // Wait for exit animation before unmounting DOM
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, 200); // 200ms matches CSS animation
        return () => clearTimeout(timer);
      }
    }, [isOpen, registerModal, unregisterModal, modalId]);

    if (!shouldRender || typeof document === "undefined") return null;

    return createPortal(
      /* Portal root — raw div required for createPortal */
      <Box
        className={"rnx-modal-overlay"}
        data-state={mounted ? "open" : "closed"}
        data-rnx-overlay="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <ModalContext.Provider value={{ titleId }}>
          <Box
            ref={mergedRef}
            className={cn(
              "rnx-modal-content",
              `rnx-modal-content--${size}`,
              className
            )}
            data-state={mounted ? "open" : "closed"}
          >
            {children}
            {!hideCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                className={"rnx-modal-close"}
                onClick={() => onClose(false)}
                aria-label="Close"
              >
                <X className={"h-4 w-4"} />
              </Button>
            )}
          </Box>
        </ModalContext.Provider>
      </Box>,
      document.body
    );
  }
);

ModalComponent.displayName = "Modal";

export const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { titleId } = React.useContext(ModalContext);
  return (
    <Box
      ref={ref}
      id={titleId}
      className={cn("rnx-modal-header", className)}
      {...props}
    />
  );
});
ModalHeader.displayName = "ModalHeader";

export const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box ref={ref} className={cn("rnx-modal-body", className)} {...props} />
));
ModalBody.displayName = "ModalBody";

export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box ref={ref} className={cn("rnx-modal-footer", className)} {...props} />
));
ModalFooter.displayName = "ModalFooter";

export const Modal = Object.assign(ModalComponent, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});
