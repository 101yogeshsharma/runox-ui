"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box } from "../../atoms/Box";
import { Button } from "../Button";
// Uses: Button
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { useMakeWayOptional } from "../Motion/MakeWayContext";
import { useClickOutside, useFocusTrap } from "../../hooks";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { useScrollLock } from "../../hooks/useScrollLock";
import { rnx } from "../../utils/rnx";
import { warnDeprecatedProp } from "../../utils/warn";
import { MODAL_EXIT_DURATION_MS } from "../../internal/timings";

import "./Modal.css";

/**
 * Modal dialog component.
 *
 * Renders an accessible, focus-trapped dialog portal with overlay. Compose
 * via dot-notation members: `Modal.Trigger`, `Modal.Header`, `Modal.Title`,
 * `Modal.Description`, `Modal.Body`, `Modal.Footer`.
 *
 * @example
 * ```tsx
 * <Modal open={open} onOpenChange={setOpen}>
 *   <Modal.Content>
 *     <Modal.Header><Modal.Title>Delete item</Modal.Title></Modal.Header>
 *     <Modal.Body>Are you sure?</Modal.Body>
 *     <Modal.Footer>...</Modal.Footer>
 *   </Modal.Content>
 * </Modal>
 * ```
 */
export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controlled open state. Preferred over the deprecated `isOpen`.
   */
  open?: boolean;
  /**
   * Called when the open state should change.
   */
  onOpenChange?: (open: boolean) => void;
  /** @deprecated Use `open` instead. */
  isOpen?: boolean;
  /** @deprecated Use `onOpenChange` instead. */
  onClose?: (open: boolean) => void;
  children: React.ReactNode;
  variant?: "solid" | "glass" | "blur";
  hideCloseButton?: boolean;
  dismissible?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  mobileVariant?: "default" | "bottom-sheet";
  /**
   * Element to portal the overlay into. Defaults to `document.body`.
   * Useful for tests (scope assertions to a container) and shadow DOM.
   */
  container?: HTMLElement;
  /**
   * Skip the exit animation entirely: content unmounts immediately when
   * closed instead of waiting for the animation to finish. Recommended in
   * tests to avoid fake-timer coupling.
   * @default false
   */
  disableExitAnimation?: boolean;
}

const ModalContext = React.createContext<{
  titleId: string;
  hasTitle: boolean;
  setHasTitle: (v: boolean) => void;
}>({ titleId: "", hasTitle: false, setHasTitle: () => {} });

const ModalComponent = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open: openProp,
      onOpenChange,
      isOpen: legacyIsOpen,
      onClose: legacyOnClose,
      children,
      variant = "solid",
      hideCloseButton = false,
      dismissible = true,
      size = "md",
      mobileVariant = "default",
      className,
      container,
      disableExitAnimation = false,
      ...props
    },
    ref,
  ) => {
    if (process.env.NODE_ENV !== "production") {
      if (legacyIsOpen !== undefined) {
        warnDeprecatedProp("Modal", "isOpen", "open");
      }
      if (legacyOnClose !== undefined) {
        warnDeprecatedProp("Modal", "onClose", "onOpenChange");
      }
    }
    const isOpen = openProp ?? legacyIsOpen ?? false;
    const handleClose = React.useCallback(
      (next: boolean) => {
        if (onOpenChange) onOpenChange(next);
        else legacyOnClose?.(next);
      },
      [onOpenChange, legacyOnClose],
    );
    const { registerModal, unregisterModal } = useMakeWayOptional();
    const rawId = React.useId();
    const modalId = `modal-${rawId.replace(/:/g, "")}`;
    const titleId = `${modalId}-title`;
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    // Set to true when a Modal.Header mounts, so aria-labelledby is only
    // applied when the referenced title actually exists in the DOM.
    const [hasTitle, setHasTitle] = useState(false);

    const modalContextValue = React.useMemo(
      () => ({ titleId, hasTitle, setHasTitle }),
      [titleId, hasTitle],
    );

    const contentRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergeRefs(contentRef, ref);

    // Close when clicking outside content (on the overlay)
    useClickOutside(contentRef, () => {
      if (dismissible && isOpen) handleClose(false);
    });

    // Trap focus
    useFocusTrap(contentRef, isOpen && shouldRender);
    useScrollLock(isOpen);

    // Close on Escape
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && dismissible && isOpen) {
          handleClose(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleClose, dismissible]);

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
        if (disableExitAnimation) {
          setShouldRender(false);
          return;
        }
        // Fallback in case the animationend event never fires
        const timer = setTimeout(
          () => setShouldRender(false),
          MODAL_EXIT_DURATION_MS,
        );
        return () => clearTimeout(timer);
      }
    }, [isOpen, registerModal, unregisterModal, modalId, disableExitAnimation]);

    if (!shouldRender || typeof document === "undefined") return null;

    return createPortal(
      /* Portal root — raw div required for createPortal */
      <Box
        {...rnx({
          component: "Modal",
          state: isOpen ? "open" : "closed",
          overlay: true,
        })}
        className={"rnx-modal-overlay"}
        data-state={mounted ? "open" : "closed"}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        onAnimationEnd={(e) => {
          if (!mounted && e.target === e.currentTarget) {
            setShouldRender(false);
          }
        }}
      >
        <ModalContext.Provider value={modalContextValue}>
          <Box
            ref={mergedRef}
            tabIndex={-1}
            className={cn(
              "rnx-modal-content",
              `rnx-modal-content--variant-${variant}`,
              `rnx-modal-content--size-${size}`,
              mobileVariant === "bottom-sheet" &&
                "rnx-modal-content--bottom-sheet",
              className,
            )}
            data-state={mounted ? "open" : "closed"}
            {...props}
          >
            {children}
            {!hideCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                className={"rnx-modal-close"}
                onClick={() => handleClose(false)}
                aria-label="Close"
              >
                <X className={"h-4 w-4"} />
              </Button>
            )}
          </Box>
        </ModalContext.Provider>
      </Box>,
      container ?? document.body,
    );
  },
);

ModalComponent.displayName = "Modal";

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { titleId, setHasTitle } = React.useContext(ModalContext);
  // Register this header as the dialog's accessible label.
  React.useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);
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

const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box ref={ref} className={cn("rnx-modal-body", className)} {...props} />
));
ModalBody.displayName = "ModalBody";

const ModalFooter = React.forwardRef<
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
