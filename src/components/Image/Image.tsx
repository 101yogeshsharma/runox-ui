"use client";

import React, { useState } from "react";
import { Box } from "../../atoms/Box";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";

import "./Image.css";

/**
 * Props for the Image component.
 */
export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  blurDataURL?: string; // For blur-up effect
  zoom?: boolean;
  decorative?: boolean;
  children?: React.ReactNode;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      className,
      src,
      fallbackSrc,
      alt = "",
      blurDataURL,
      zoom = false,
      decorative = false,
      children,
      onLoad,
      onError,
      ...props
    },
    ref,
  ) => {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">(
      "loading",
    );

    const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
    const [prevSrc, setPrevSrc] = useState<string | undefined>(src);
    const [hasAttemptedFallback, setHasAttemptedFallback] = useState(false);

    if (src !== prevSrc) {
      setPrevSrc(src);
      setCurrentSrc(src);
      setStatus("loading");
      setHasAttemptedFallback(false);
    }

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (fallbackSrc && !hasAttemptedFallback) {
        setHasAttemptedFallback(true);
        // Update state rather than mutating the DOM directly so React re-renders
        // can't revert the src back to the broken original.
        setCurrentSrc(fallbackSrc);
        return;
      }
      setStatus("error");
      onError?.(e);
    };

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setStatus("loaded");
      onLoad?.(e);
    };

    return (
      <Box
        {...rnx({
          component: "Image",
          state:
            status === "loaded"
              ? "active"
              : status === "error"
                ? "error"
                : "loading",
        })}
        className={cn(
          "rnx-image-container",
          zoom && "rnx-image-container--zoom",
          className,
        )}
      >
        {/* Blur placeholder */}
        {blurDataURL && status === "loading" && (
          <img
            src={blurDataURL}
            alt="placeholder"
            className="rnx-image-placeholder"
            aria-hidden="true"
          />
        )}

        {/* Skeleton fallback if no blurDataURL */}
        {!blurDataURL && status === "loading" && (
          <Box
            className="rnx-image-fallback animate-pulse"
            aria-hidden="true"
          />
        )}

        {/* Main image */}
        {status === "error" ? (
          children || (
            <Box className="rnx-image-error" role="alert">
              Failed to load
            </Box>
          )
        ) : (
          <img
            ref={ref}
            src={currentSrc}
            alt={decorative ? "" : alt}
            role={decorative ? "presentation" : props.role}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "rnx-image",
              status === "loaded" ? "opacity-100" : "opacity-0",
            )}
            {...props}
          />
        )}
      </Box>
    );
  },
);

Image.displayName = "Image";
