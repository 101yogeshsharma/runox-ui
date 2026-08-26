"use client";
import { Box } from "../../atoms/Box";

import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Eraser } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../Button";
import "./SignaturePad.css";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";

// Uses: Button

/**
 * Props for the SignaturePad component.
 */
export interface SignaturePadProps extends Omit<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  "onEnded"
> {
  className?: string;
  canvasClassName?: string;
  penColor?: string;
  backgroundColor?: string;
  onEnd?: (dataUrl: string) => void;
  showClearButton?: boolean;
  height?: number;
  typedFallback?: boolean;
  onTypedChange?: (value: string) => void;
}

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: (type?: string, encoderOptions?: number) => string | null;
}

const SignaturePadBase = forwardRef<SignaturePadRef, SignaturePadProps>(
  (
    {
      className,
      canvasClassName,
      penColor = "currentColor",
      backgroundColor = "transparent",
      onEnd,
      showClearButton = true,
      height = 200,
      typedFallback = false,
      onTypedChange,
      ...props
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasWidth, setCanvasWidth] = useState(500);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    // Track hasDrawn in a ref so the resize effect can read it without
    // being triggered by it — avoids the infinite clear loop.
    const hasDrawnRef = useRef(false);
    const savedImageRef = useRef<string | null>(null);

    const clearCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      hasDrawnRef.current = false;
      setHasDrawn(false);
    }, [backgroundColor]);

    useImperativeHandle(ref, () => ({
      clear: () => {
        clearCanvas();
        onEnd?.("");
      },
      isEmpty: () => !hasDrawn,
      toDataURL: (type = "image/png", encoderOptions?: number) => {
        if (!hasDrawn) return null;
        const canvas = canvasRef.current;
        return canvas ? canvas.toDataURL(type, encoderOptions) : null;
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;
      if (typeof ResizeObserver === "undefined") return;
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = entry.contentRect.width;
          if (newWidth > 0 && newWidth !== canvasWidth) {
            const canvas = canvasRef.current;
            if (canvas && hasDrawnRef.current) {
              savedImageRef.current = canvas.toDataURL();
            }
            setCanvasWidth(newWidth);
          }
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, [canvasWidth]);

    // Restore canvas content on resize — depends only on dimensions, NOT on hasDrawn
    // so drawing never triggers a canvas wipe.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvasWidth > 0 && canvas) {
        const ctx = canvas.getContext("2d");

        clearCanvas();

        if (savedImageRef.current && ctx) {
          const img = new window.Image();
          img.src = savedImageRef.current;
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            // Restore drawn state after image reloaded
            hasDrawnRef.current = true;
            setHasDrawn(true);
          };
        }
      }
      // Intentionally excluding hasDrawn — we read it via hasDrawnRef to avoid loops
    }, [canvasWidth, height, clearCanvas]);

    const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { x, y } = getCoordinates(e);

      ctx.beginPath();
      ctx.moveTo(x, y);

      if (penColor === "currentColor") {
        ctx.strokeStyle = window.getComputedStyle(canvas).color;
      } else {
        ctx.strokeStyle = penColor;
      }

      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      setIsDrawing(true);
      setHasDrawn(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    };

    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { x, y } = getCoordinates(e);

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isDrawing) {
        setIsDrawing(false);
        e.currentTarget.releasePointerCapture(e.pointerId);

        if (onEnd && canvasRef.current) {
          onEnd(canvasRef.current.toDataURL("image/png"));
        }
      }
    };

    const handleClear = () => {
      clearCanvas();
      onEnd?.("");
    };

    return (
      <Box
        {...rnx({ component: "SignaturePad" })}
        ref={containerRef}
        className={cn("rnx-signature-pad", className)}
      >
        <Box className="rnx-signature-pad__controls">
          {showClearButton && (
            <Button
              variant="outline"
              size="icon"
              className="rnx-signature-pad__clear-button"
              onClick={handleClear}
              aria-label="Clear signature"
              title="Clear Signature"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          )}
        </Box>

        <Box
          className="rnx-signature-pad__canvas-container"
          style={{ height: `${height}px` }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={height}
            role="img"
            aria-label={
              props["aria-label"] ||
              "Signature drawing area — use mouse or touch to sign"
            }
            tabIndex={0}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            className={cn("rnx-signature-pad__canvas", canvasClassName)}
            {...props}
          />
          <Box className="rnx-signature-pad__guide-line" />
          <Box as="span" className="rnx-signature-pad__guide-label">
            Sign here
          </Box>
        </Box>

        {typedFallback && (
          <Box className="rnx-signature-pad__fallback mt-3">
            <label
              htmlFor={`${props.id || "rnx-signature"}-fallback`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Keyboard alternative: Type your full name
            </label>
            <input
              id={`${props.id || "rnx-signature"}-fallback`}
              type="text"
              placeholder="Type your name to sign"
              aria-label="Typed signature alternative"
              className="rnx-input w-full px-3 py-1.5 text-sm border rounded bg-transparent"
              onChange={(e) => onTypedChange?.(e.target.value)}
            />
          </Box>
        )}
      </Box>
    );
  },
);
SignaturePadBase.displayName = "SignaturePad";
export const SignaturePad = withLoading(SignaturePadBase);
