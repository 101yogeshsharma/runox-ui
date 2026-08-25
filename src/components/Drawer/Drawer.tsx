"use client";

import React, {
  useEffect,
  useState,
  useRef,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { X } from "lucide-react";
import { Button } from "../Button";
import { Text } from "../../atoms/Text";
import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { warnDeprecatedProp } from "../../utils/warn";
import "./Drawer.css";

const DrawerTitleContext = createContext<{
  titleId: string;
  setHasTitle: (v: boolean) => void;
}>({ titleId: "", setHasTitle: () => {} });

/**
 * A panel that slides in from the edge of the screen.
 */
export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
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
  onClose?: () => void;
  variant?: "solid" | "glass" | "blur";
  position?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "full";
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
  snapPoints?: (number | string)[];
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snap: number | string | null) => void;
  isDraggable?: boolean;
  /**
   * Element to portal the drawer into. Defaults to `document.body`.
   * Useful for tests or rendering inside a specific container.
   */
  container?: HTMLElement;
}

const DrawerComponent = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open: openProp,
      onOpenChange,
      isOpen: legacyIsOpen,
      onClose: legacyOnClose,
      variant = "glass",
      position = "right",
      size = "md",
      children,
      className,
      hideCloseButton = false,
      snapPoints,
      activeSnapPoint,
      setActiveSnapPoint,
      isDraggable = true,
      container,
      ...props
    },
    ref,
  ) => {
    const [mounted, setMounted] = useState(false);
    const [renderState, setRenderState] = useState<"closed" | "open">("closed");
    const [shouldRender, setShouldRender] = useState(false);
    // Set when a Drawer.Title mounts so aria-labelledby is only applied
    // when the referenced title exists in the DOM.
    const [hasTitle, setHasTitle] = useState(false);
    const drawerId = React.useId().replace(/:/g, "");
    const titleId = `rnx-drawer-title-${drawerId}`;

    const contentRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergeRefs(contentRef, ref);
    const isDragging = useRef(false);
    const startPos = useRef(0);
    const currentOffset = useRef(0);
    const [dragging, setDragging] = useState(false);
    const [internalExpanded, setInternalExpanded] = useState(false);

    if (process.env.NODE_ENV !== "production") {
      if (legacyIsOpen !== undefined) {
        warnDeprecatedProp("Drawer", "isOpen", "open");
      }
      if (legacyOnClose !== undefined) {
        warnDeprecatedProp("Drawer", "onClose", "onOpenChange");
      }
    }
    const isOpen = openProp ?? legacyIsOpen ?? false;
    const handleClose = React.useCallback(() => {
      if (onOpenChange) onOpenChange(false);
      else legacyOnClose?.();
    }, [onOpenChange, legacyOnClose]);

    useFocusTrap(contentRef, isOpen && shouldRender);
    useScrollLock(isOpen);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (isOpen) {
        setShouldRender(true);
        requestAnimationFrame(() => setRenderState("open"));
      } else {
        setRenderState("closed");
        setInternalExpanded(false);
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) handleClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, handleClose]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggable) return;
      if (
        (e.target as HTMLElement).closest(
          "button, input, textarea, a, select, [role='button']",
        )
      )
        return;

      const isVertical = position === "bottom" || position === "top";
      startPos.current = isVertical ? e.clientY : e.clientX;
      isDragging.current = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current || !contentRef.current) return;
      const isVertical = position === "bottom" || position === "top";
      const current = isVertical ? e.clientY : e.clientX;
      const delta = current - startPos.current;

      // Apply constraints
      if (position === "bottom" && delta < 0 && !snapPoints) {
        currentOffset.current = 0; // Prevent drag up past initial state if no snap points
      } else if (position === "right" && delta < 0) {
        currentOffset.current = 0;
      } else if (position === "top" && delta > 0) {
        currentOffset.current = 0;
      } else if (position === "left" && delta > 0) {
        currentOffset.current = 0;
      } else {
        currentOffset.current = delta;
      }

      const transformValue = isVertical
        ? `translateY(${currentOffset.current}px)`
        : `translateX(${currentOffset.current}px)`;

      contentRef.current.style.transform = transformValue;
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);

      const threshold = 100;

      // Handle Snap Points logic
      if (snapPoints && activeSnapPoint !== undefined && setActiveSnapPoint) {
        const idx = snapPoints.indexOf(activeSnapPoint as string | number);
        // For bottom/right: positive delta = dragging toward closing (collapse)
        // For top/left:     negative delta = dragging toward closing (collapse)
        const collapseDir =
          position === "bottom" || position === "right" ? 1 : -1;
        if (currentOffset.current * collapseDir > 50 && idx > 0) {
          setActiveSnapPoint(snapPoints[idx - 1]);
        } else if (
          currentOffset.current * collapseDir < -50 &&
          idx < snapPoints.length - 1
        ) {
          setActiveSnapPoint(snapPoints[idx + 1]);
        } else if (
          currentOffset.current * collapseDir > threshold &&
          idx === 0
        ) {
          handleClose(); // close if dragging past the lowest snap point
        }
        if (contentRef.current) contentRef.current.style.transform = "";
        currentOffset.current = 0;
        return;
      }

      // Handle standard dismiss logic
      let shouldClose = false;
      if (position === "bottom" && currentOffset.current > threshold)
        shouldClose = true;
      if (position === "right" && currentOffset.current > threshold)
        shouldClose = true;
      if (position === "top" && currentOffset.current < -threshold)
        shouldClose = true;
      if (position === "left" && currentOffset.current < -threshold)
        shouldClose = true;

      if (shouldClose) {
        if (contentRef.current) contentRef.current.style.transform = "";
        handleClose();
      } else {
        if (contentRef.current) contentRef.current.style.transform = "";
        currentOffset.current = 0;
      }
    };

    if (!mounted || !shouldRender || typeof document === "undefined")
      return null;

    const calculateSnapHeight = (snap: number | string) => {
      if (typeof snap === "number") return `${snap * 100}vh`;
      return snap;
    };

    const isVertical = position === "bottom" || position === "top";

    const dynamicStyle: React.CSSProperties = {
      touchAction: isDraggable ? "none" : "auto",
      height:
        snapPoints && activeSnapPoint != null && isVertical
          ? calculateSnapHeight(activeSnapPoint as string | number)
          : internalExpanded && isVertical
            ? "100vh"
            : undefined,
      transition:
        "height 0.3s cubic-bezier(0.32, 0.72, 0, 1), transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
    };
    let collapseButtonNode: React.ReactNode = null;
    if (
      isDraggable &&
      isVertical &&
      snapPoints &&
      activeSnapPoint !== undefined &&
      setActiveSnapPoint
    ) {
      collapseButtonNode = (
        <Box className="rnx-drawer-collapse-btn-wrapper">
          <Button
            variant="ghost"
            size="sm"
            className="rnx-drawer-collapse-btn"
            onClick={() => {
              const idx = snapPoints.indexOf(
                activeSnapPoint as string | number,
              );
              if (idx === snapPoints.length - 1) {
                setActiveSnapPoint(snapPoints[0]);
              } else {
                setActiveSnapPoint(snapPoints[snapPoints.length - 1]);
              }
            }}
          >
            {activeSnapPoint === snapPoints[snapPoints.length - 1]
              ? "Collapse"
              : "Expand"}
          </Button>
        </Box>
      );
    } else if (isDraggable && position === "bottom") {
      collapseButtonNode = (
        <Box className="rnx-drawer-collapse-btn-wrapper">
          <Button
            variant="ghost"
            size="sm"
            className="rnx-drawer-collapse-btn"
            onClick={() => setInternalExpanded(!internalExpanded)}
          >
            {internalExpanded ? "Collapse" : "Expand"}
          </Button>
        </Box>
      );
    }

    return createPortal(
      <DrawerTitleContext.Provider value={{ titleId, setHasTitle }}>
        <Box className={"rnx-drawer-overlay"}>
          <Box
            onClick={handleClose}
            data-state={renderState}
            className={"rnx-drawer-backdrop"}
          />

          <Box
            ref={mergedRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={hasTitle ? titleId : undefined}
            data-state={renderState}
            data-dragging={dragging}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={dynamicStyle}
            className={cn(
              "rnx-drawer-content",
              `rnx-drawer-content--variant-${variant}`,
              `rnx-drawer--position-${position}`,
              `rnx-drawer--size-${size}`,
              internalExpanded
                ? "!h-screen !w-screen !rounded-none border-none"
                : "",
              className,
            )}
            {...rnx({
              component: "Drawer",
              state: isOpen ? "open" : "closed",
              overlay: true,
            })}
            {...props}
          >
            {collapseButtonNode}
            {!hideCloseButton && (
              <Box className="rnx-drawer-close-btn">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="rnx-drawer-close-icon-btn"
                >
                  <X size={16} />
                </Button>
              </Box>
            )}
            <Box
              className={"rnx-drawer-scroll-area touch-auto"}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </DrawerTitleContext.Provider>,
      container ?? document.body,
    );
  },
);

DrawerComponent.displayName = "Drawer";

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box ref={ref} className={cn("rnx-drawer-header", className)} {...props} />
));
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box ref={ref} className={cn("rnx-drawer-footer", className)} {...props} />
));
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  Omit<Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">, "color">
>(({ className, id, ...props }, ref) => {
  const { titleId, setHasTitle } = useContext(DrawerTitleContext);
  // Register this title as the dialog's accessible label.
  React.useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);
  return (
    <Text
      as="h3"
      ref={ref as React.Ref<HTMLHeadingElement>}
      id={id ?? titleId}
      variant="h3"
      className={cn("rnx-drawer-title", className)}
      {...props}
    />
  );
});
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  Omit<Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">, "color">
>(({ className, ...props }, ref) => (
  <Text
    as="p"
    ref={ref as React.Ref<HTMLParagraphElement>}
    variant="body"
    className={cn("rnx-drawer-description", className)}
    {...props}
  />
));
DrawerDescription.displayName = "DrawerDescription";

export const Drawer = Object.assign(DrawerComponent, {
  Header: DrawerHeader,
  Footer: DrawerFooter,
  Title: DrawerTitle,
  Description: DrawerDescription,
});
