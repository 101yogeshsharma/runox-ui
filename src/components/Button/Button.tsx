"use client";
import React, { forwardRef, useRef, useEffect } from "react";
import { Box } from "../../atoms/Box";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { cn } from "../../utils/cn";
import "./Button.css";
import { useTheme } from "../ThemeProvider/ThemeProvider";

import type {
  PolymorphicComponentPropsWithRef,
} from "../../utils/types";

export interface ButtonBaseProps {
  variant?: "solid" | "outline" | "ghost" | "glass" | "icon" | "fab";
  color?: "default" | "primary" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon" | "fab";
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isMagnetic?: boolean;
}

export type ButtonProps<C extends React.ElementType> =
  PolymorphicComponentPropsWithRef<C, ButtonBaseProps>;

type ButtonComponent = <C extends React.ElementType = "button">(
  props: ButtonProps<C>
) => React.ReactElement | null;

export function buttonVariants({
  variant = "solid",
  color = "default",
  size = "md",
  fullWidth = false,
  className = "",
}: ButtonBaseProps & { className?: string } = {}) {
  const finalSize =
    size || (variant === "icon" ? "icon" : variant === "fab" ? "fab" : "md");
  return cn(
    "rnx-button",
    `rnx-button--${variant}-${color}`,
    `rnx-button--size-${finalSize}`,
    variant === "fab" && "rnx-button--variant-fab",
    fullWidth && "rnx-button--full-width",
    className
  );
}

export const Button = forwardRef(
  (props: ButtonProps<React.ElementType>, forwardedRef: React.Ref<unknown>) => {
    const {
      children,
      variant = "solid",
      color = "default",
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      isMagnetic = false,
      className = "",
      as,
      ...rest
    } = props;
    const { config } = useTheme();

    const Component = as || "button";
    const localRef = useRef<HTMLElement>(null);
    const disabled = "disabled" in rest ? !!rest.disabled : false;

    const mergedRef = useMergeRefs(forwardedRef, localRef);

    useEffect(() => {
      if (!isMagnetic || !localRef.current || disabled || isLoading) return;
      const el = localRef.current;
      let x = 0,
        y = 0,
        reqId: number;
      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const hw = rect.width / 2;
        const hh = rect.height / 2;
        x = (e.clientX - rect.left - hw) * 0.2;
        y = (e.clientY - rect.top - hh) * 0.3;
        reqId = requestAnimationFrame(() => {
          el.style.transform = `translate(${x}px, ${y}px)`;
        });
      };
      const handleMouseLeave = () => {
        cancelAnimationFrame(reqId);
        el.style.transform = `translate(0px, 0px)`;
      };
      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseleave", handleMouseLeave);
        cancelAnimationFrame(reqId);
      };
    }, [isMagnetic, disabled, isLoading]);

    const Tag =
      "href" in rest && rest.href && Component === "button" ? "a" : Component;

    // Adjust size automatically for icon/fab variants if not explicitly set
    const finalSize =
      size || (variant === "icon" ? "icon" : variant === "fab" ? "fab" : "md");

    return (
      <Tag
        ref={mergedRef}
        className={cn(
          "rnx-button",
          `rnx-button--${variant}-${color}`,
          `rnx-button--size-${finalSize}`,
          variant === "fab" && "rnx-button--variant-fab",
          fullWidth && "rnx-button--full-width",
          isLoading && "rnx-button--loading",
          `rounded-${config.radius}`,
          className
        )}
        {...rest}
        {...(Tag === "button"
          ? {
              disabled: disabled || isLoading,
              type: "type" in rest ? rest.type : "button",
            }
          : {
              // Anchors don't support the `disabled` attribute — use aria + tabIndex instead
              "aria-disabled": disabled || isLoading || undefined,
              tabIndex:
                disabled || isLoading
                  ? -1
                  : (rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)
                      .tabIndex,
              onClick:
                disabled || isLoading
                  ? (e: React.MouseEvent) => {
                      e.preventDefault();
                      // Do NOT call user's onClick when disabled
                    }
                  : (rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)
                      .onClick,
            })}
      >
        {isLoading && <Box as="span" className="rnx-button__spinner" />}
        <Box
          as="span"
          className={cn(
            "rnx-button__content",
            isLoading && "rnx-button__content--hidden"
          )}
        >
          {leftIcon && (
            <Box as="span" className="rnx-button__icon-container">
              {leftIcon}
            </Box>
          )}
          {children}
          {rightIcon && (
            <Box as="span" className="rnx-button__icon-container">
              {rightIcon}
            </Box>
          )}
        </Box>
      </Tag>
    );
  }
) as unknown as ButtonComponent;

Object.assign(Button, { displayName: "Button" });
