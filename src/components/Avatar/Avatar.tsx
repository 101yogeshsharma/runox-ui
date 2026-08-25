"use client";
import React, { forwardRef, useState, useEffect } from "react";
import { Box } from "../../atoms/Box";
import { Image } from "../Image/Image";
// Uses: Image
import { cn } from "../../utils/cn";
import "./Avatar.css";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";

/**
 * Displays a user's profile image with automatic fallback to initials or a placeholder.
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  variant?: "solid" | "ringed" | "glass";
  status?: "online" | "offline" | "busy" | "away";
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square" | "rounded";
}

const AvatarBase = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = "Avatar",
      fallback,
      variant = "solid",
      status,
      size = "md",
      shape = "circle",
      className,
      ...props
    },
    ref,
  ) => {
    const [hasError, setHasError] = useState(false);
    const FallbackContent = fallback || alt.charAt(0).toUpperCase();

    // Reset error state if src changes
    useEffect(() => {
      setHasError(false);
    }, [src]);

    return (
      <Box
        {...rnx({ component: "Avatar" })}
        ref={ref}
        className={cn(
          "rnx-avatar",
          `rnx-avatar--size-${size}`,
          `rnx-avatar--shape-${shape}`,
          variant && variant !== "solid" && `rnx-avatar--variant-${variant}`,
          className,
        )}
        {...props}
      >
        {src && !hasError ? (
          <Image
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="rnx-avatar-image"
          />
        ) : (
          <Box className="rnx-avatar-fallback">{FallbackContent}</Box>
        )}
        {status && (
          <span
            className={cn(
              "rnx-avatar-status",
              `rnx-avatar-status--size-${size}`,
              `rnx-avatar-status--status-${status}`,
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </Box>
    );
  },
);

AvatarBase.displayName = "Avatar";
export const Avatar = withLoading(AvatarBase);
