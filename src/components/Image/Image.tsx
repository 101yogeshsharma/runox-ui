"use client";

import React, { useState } from "react";
import { Box } from "../../atoms/Box";
import { cn } from "../../utils/cn";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  blurDataURL?: string; // For blur-up effect
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
      children,
      onLoad,
      onError,
      ...props
    },
    ref
  ) => {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">(
      "loading"
    );

    const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
    const [hasAttemptedFallback, setHasAttemptedFallback] = useState(false);

    if (src !== currentSrc) {
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
      <Box className={cn("relative overflow-hidden", className)}>
        {/* Blur placeholder */}
        {blurDataURL && status === "loading" && (
          <img
            src={blurDataURL}
            alt="placeholder"
            className="absolute inset-0 h-full w-full object-cover blur-md filter"
            aria-hidden="true"
          />
        )}

        {/* Skeleton fallback if no blurDataURL */}
        {!blurDataURL && status === "loading" && (
          <Box
            className="bg-muted absolute inset-0 h-full w-full animate-pulse"
            aria-hidden="true"
          />
        )}

        {/* Main image */}
        {status === "error" ? (
          children || (
            <Box className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-center text-sm">
              Failed to load
            </Box>
          )
        ) : (
          <img
            ref={ref}
            src={currentSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              status === "loaded" ? "opacity-100" : "opacity-0"
            )}
            {...props}
          />
        )}
      </Box>
    );
  }
);

Image.displayName = "Image";
