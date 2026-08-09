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
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { useTheme } from "../ThemeProvider/ThemeProvider";
import "./Drawer.css";

const DrawerTitleContext = createContext<string | undefined>(undefined);

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "full";
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
  snapPoints?: (number | string)[];
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snap: number | string | null) => void;
  isDraggable?: boolean;
}

const DrawerComponent = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      isOpen,
      onClose,
      position = "right",
      size = "md",
      children,
      className,
      hideCloseButton = false,
      snapPoints,
      activeSnapPoint,
      setActiveSnapPoint,
      isDraggable = true,
    },
    ref
  ) => {
    const { config } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [renderState, setRenderState] = useState<"closed" | "open">("closed");
    const [shouldRender, setShouldRender] = useState(false);
    const drawerId = React.useId().replace(/:/g, "");
    const titleId = `rnx-drawer-title-${drawerId}`;

    const contentRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergeRefs(contentRef, ref);
    const isDragging = useRef(false);
    const startPos = useRef(0);
    const currentOffset = useRef(0);
    const [dragging, setDragging] = useState(false);
    const [internalExpanded, setInternalExpanded] = useState(false);

    useFocusTrap(contentRef, isOpen);
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
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [isOpen]);

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) onClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggable) return;
      if (
        (e.target as HTMLElement).closest(
          "button, input, textarea, a, select, [role='button']"
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
          onClose(); // close if dragging past the lowest snap point
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
        onClose();
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

    return createPortal(
      <DrawerTitleContext.Provider value={titleId}>
        <Box className={"rnx-drawer-overlay"}>
          <Box
            onClick={onClose}
            data-state={renderState}
            className={"rnx-drawer-backdrop"}
          />

          <Box
            ref={mergedRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-state={renderState}
            data-dragging={dragging}
            data-rnx-overlay="true"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={dynamicStyle}
            className={cn(
              "rnx-drawer-content",
              `rnx-drawer--${position}`,
              `rnx-drawer--${position}-${size}`,
              `rounded-${config.radius}`,
              internalExpanded
                ? "!h-screen !w-screen !rounded-none border-none"
                : "",
              className
            )}
          >
            {isDraggable &&
            isVertical &&
            snapPoints &&
            activeSnapPoint !== undefined &&
            setActiveSnapPoint ? (
              <Box className={"mt-3 mb-1 flex justify-center"}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-foreground/5 hover:bg-foreground/10 text-foreground h-6 rounded-full px-4 py-0 text-xs"
                  onClick={() => {
                    const idx = snapPoints.indexOf(
                      activeSnapPoint as string | number
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
            ) : isDraggable && isVertical ? (
              <Box className={"mt-3 mb-1 flex justify-center"}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-foreground/5 hover:bg-foreground/10 text-foreground h-6 rounded-full px-4 py-0 text-xs"
                  onClick={() => setInternalExpanded(!internalExpanded)}
                >
                  {internalExpanded ? "Collapse" : "Expand"}
                </Button>
              </Box>
            ) : null}
            {!hideCloseButton && (
              <Box className={"rnx-drawer-close-btn"}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="bg-foreground/[0.04] hover:bg-foreground/10 text-foreground h-8 w-8 rounded-full p-0"
                >
                  <X size={16} />
                </Button>
              </Box>
            )}
            <Box
              className={"rnx-drawer-scroll-area"}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ touchAction: "auto" }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </DrawerTitleContext.Provider>,
      document.body
    );
  }
);

DrawerComponent.displayName = "Drawer";

export const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box ref={ref} className={cn("rnx-drawer-header", className)} {...props} />
));
DrawerHeader.displayName = "DrawerHeader";

export const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Box ref={ref} className={cn("rnx-drawer-footer", className)} {...props} />
));
DrawerFooter.displayName = "DrawerFooter";

export const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  Omit<Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">, "color">
>(({ className, id, ...props }, ref) => {
  const titleId = useContext(DrawerTitleContext);
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

export const DrawerDescription = React.forwardRef<
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
