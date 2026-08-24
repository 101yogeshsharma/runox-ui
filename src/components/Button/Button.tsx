"use client";
import React, { forwardRef, useRef, useEffect } from "react";
import { Box } from "../../atoms/Box";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { cn } from "../../utils/cn";
import "./Button.css";
import { rnx } from "../../utils/rnx";
import { warnInvalidProps } from "../../utils/warn";

import type { PolymorphicComponentPropsWithRef } from "../../utils/types";

/**
 * The standard interactive button component. Use to trigger actions, submit forms, or handle click events.
 */
export interface ButtonBaseProps {
  variant?: "solid" | "outline" | "ghost" | "glass" | "icon" | "fab";
  color?: "default" | "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon" | "fab";
  fullWidth?: boolean;
  /** Whether the button displays a loading spinner */
  loading?: boolean;
  /** @deprecated Use `loading` instead */
  isLoading?: boolean;
  /** @deprecated Use standard `disabled` instead */
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isMagnetic?: boolean;
}

export type ButtonProps<C extends React.ElementType> =
  PolymorphicComponentPropsWithRef<C, ButtonBaseProps>;

type ButtonComponent = <C extends React.ElementType = "button">(
  props: ButtonProps<C>,
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
    className,
  );
}

const ButtonBase = forwardRef(
  (props: ButtonProps<React.ElementType>, forwardedRef: React.Ref<unknown>) => {
    const {
      children,
      variant = "solid",
      color = "default",
      size,
      fullWidth,
      loading,
      isLoading,
      isDisabled,
      leftIcon,
      rightIcon,
      isMagnetic = false,
      className = "",
      as,
      ...rest
    } = props;

    const Component = as || "button";
    const localRef = useRef<HTMLElement>(null);
    const isButtonLoading = loading ?? isLoading ?? false;
    const disabled =
      ("disabled" in rest ? !!rest.disabled : false) ||
      isDisabled ||
      isButtonLoading;

    // Dev-mode warning for missing aria-label on icon/fab buttons
    if (process.env.NODE_ENV !== "production") {
      if ((variant === "icon" || variant === "fab") && !rest["aria-label"]) {
        warnInvalidProps(
          "Button",
          `variant="${variant}" was used without an \`aria-label\`. Icon-only buttons must have an \`aria-label\` for screen readers.`,
        );
      }
    }

    const mergedRef = useMergeRefs(forwardedRef, localRef);

    useEffect(() => {
      if (!isMagnetic || !localRef.current || disabled || isButtonLoading)
        return;
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
    }, [isMagnetic, disabled, isButtonLoading]);

    const Tag =
      "href" in rest && rest.href && Component === "button" ? "a" : Component;

    // Adjust size automatically for icon/fab variants if not explicitly set
    const finalSize =
      size || (variant === "icon" ? "icon" : variant === "fab" ? "fab" : "md");

    return (
      <Tag
        ref={mergedRef}
        {...rnx({
          component: "Button",
          variant: variant,
          state: isButtonLoading
            ? "loading"
            : disabled
              ? "disabled"
              : undefined,
          action:
            "type" in rest && rest.type === "submit" ? "submit" : undefined,
        })}
        className={cn(
          "rnx-button",
          `rnx-button--${variant}-${color}`,
          `rnx-button--size-${finalSize}`,
          variant === "fab" && "rnx-button--variant-fab",
          fullWidth && "rnx-button--full-width",
          isButtonLoading && "rnx-button--loading",
          className,
        )}
        {...rest}
        {...(Tag === "button"
          ? {
              disabled: disabled,
              type: "type" in rest ? rest.type : "button",
            }
          : {
              // Anchors don't support the `disabled` attribute — use aria + tabIndex instead
              "aria-disabled": disabled || undefined,
              tabIndex: disabled
                ? -1
                : (rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)
                    .tabIndex,
              onClick: disabled
                ? (e: React.MouseEvent) => {
                    e.preventDefault();
                    // Do NOT call user's onClick when disabled
                  }
                : (rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)
                    .onClick,
            })}
      >
        {isButtonLoading && <Box as="span" className="rnx-button__spinner" />}
        <Box
          as="span"
          className={cn(
            "rnx-button__content",
            isButtonLoading && "rnx-button__content--hidden",
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
  },
);

ButtonBase.displayName = "Button";
export const Button = React.memo(ButtonBase) as unknown as ButtonComponent;
