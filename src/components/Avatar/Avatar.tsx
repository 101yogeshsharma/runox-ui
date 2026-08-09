"use client";
import React, { forwardRef, useState, useEffect } from "react";
import { Box } from "../../atoms/Box";
import { Image } from "../Image/Image";
// Uses: Image
import { cn } from "../../utils/cn";
import "./Avatar.css";
import { useTheme } from "../ThemeProvider/ThemeProvider";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square" | "rounded";
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = "Avatar",
      fallback,
      size = "md",
      shape = "circle",
      className,
      ...props
    },
    ref
  ) => {
    const { config } = useTheme();
    const [hasError, setHasError] = useState(false);
    const FallbackContent = fallback || alt.charAt(0).toUpperCase();

    // Reset error state if src changes
    useEffect(() => {
      setHasError(false);
    }, [src]);

    return (
      <Box
        ref={ref}
        className={cn(
          "rnx-avatar",
          `rnx-avatar--${size}`,
          `rnx-avatar--${shape}`,
          `rounded-${config.radius}`,
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          <Image
            src={src}
            alt={alt}
            className="rnx-avatar-image"
            onError={() => setHasError(true)}
          />
        ) : (
          <Box as="span" className="rnx-avatar-fallback">
            {FallbackContent}
          </Box>
        )}
      </Box>
    );
  }
);

Avatar.displayName = "Avatar";
