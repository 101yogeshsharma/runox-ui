import React from "react";
import { cn } from "../../utils/cn";
import "./Text.css";

export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "body-sm"
  | "caption"
  | "overline"
  | "code";
export type TextColor =
  | "primary"
  | "secondary"
  | "brand"
  | "success"
  | "danger"
  | "warning"
  | "inherit";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
export type TextAlign = "left" | "center" | "right";

import type {
  PolymorphicComponentPropsWithRef,
  PolymorphicRef,
} from "../../utils/types";

export interface TextBaseProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextWeight;
  align?: TextAlign;
  truncate?: boolean;
  maxLines?: number;
  gradient?: "primary" | "info" | "success" | "warning" | "danger" | "ai";
}

export type TextProps<C extends React.ElementType> =
  PolymorphicComponentPropsWithRef<C, TextBaseProps>;

type TextComponent = <C extends React.ElementType = "p">(
  props: TextProps<C>
) => React.ReactElement | null;

const variantStyles: Record<TextVariant, React.CSSProperties> = {
  h1: {
    fontSize: "var(--fontSize-4xl-0, 2.25rem)",
    lineHeight: "var(--fontSize-4xl-1-lineHeight, 2.5rem)",
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-medium, 500)",
    letterSpacing: "var(--letterSpacing-tight, -0.02em)",
  },
  h2: {
    fontSize: "var(--fontSize-2xl-0, 1.5rem)",
    lineHeight: "var(--fontSize-2xl-1-lineHeight, 2rem)",
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-medium, 500)",
    letterSpacing: "var(--letterSpacing-tight, -0.02em)",
  },
  h3: {
    fontSize: "var(--fontSize-lg-0, 1.1rem)",
    lineHeight: "var(--fontSize-lg-1-lineHeight, 1.75rem)",
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-medium, 500)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
  h4: {
    fontSize: "var(--fontSize-md-0, 1rem)",
    lineHeight: "var(--fontSize-md-1-lineHeight, 1.5rem)",
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-medium, 500)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
  body: {
    fontSize: "var(--fontSize-base-0, 0.95rem)",
    lineHeight: "var(--fontSize-base-1-lineHeight, 1.6rem)",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fontWeight-normal, 400)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
  "body-sm": {
    fontSize: "var(--fontSize-sm-0, 0.85rem)",
    lineHeight: "var(--fontSize-sm-1-lineHeight, 1.25rem)",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fontWeight-normal, 400)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
  caption: {
    fontSize: "var(--fontSize-xs-0, 0.75rem)",
    lineHeight: "var(--fontSize-xs-1-lineHeight, 1rem)",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fontWeight-normal, 400)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
  overline: {
    fontSize: "var(--fontSize-2xs-0, 0.625rem)",
    lineHeight: "var(--fontSize-2xs-1-lineHeight, 0.875rem)",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fontWeight-bold, 700)",
    letterSpacing: "var(--letterSpacing-widest, 0.15em)",
    textTransform: "uppercase",
  },
  code: {
    fontSize: "var(--fontSize-sm-0, 0.8125rem)",
    lineHeight: "var(--fontSize-sm-1-lineHeight, 1.25rem)",
    fontFamily: "var(--font-mono)",
    fontWeight: "var(--fontWeight-normal, 400)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
};

const defaultElement: Record<TextVariant, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  "body-sm": "p",
  caption: "span",
  overline: "span",
  code: "code",
};

const colorMap: Record<TextColor, string> = {
  primary: "var(--text-main)",
  secondary: "var(--text-muted)",
  brand: "var(--brand-alt)",
  success: "var(--brand-success)",
  danger: "var(--brand-danger)",
  warning: "var(--brand-warning)",
  inherit: "inherit",
};

const gradientClasses: Record<string, string> = {
  primary:
    "bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50",
  info: "bg-clip-text text-transparent bg-gradient-to-br from-info to-cyan-300",
  success:
    "bg-clip-text text-transparent bg-gradient-to-br from-success to-emerald-200",
  warning:
    "bg-clip-text text-transparent bg-gradient-to-br from-warning to-yellow-200",
  danger:
    "bg-clip-text text-transparent bg-gradient-to-br from-destructive to-rose-300",
  ai: "bg-clip-text text-transparent bg-gradient-to-br from-ai via-purple-500 to-cyan-400",
};

export const Text = React.forwardRef(
  (props: TextProps<React.ElementType>, ref: React.Ref<unknown>) => {
    const {
      children,
      variant = "body",
      color = "inherit",
      weight,
      align,
      truncate = false,
      maxLines,
      gradient,
      as,
      style,
      className,
      ...rest
    } = props;
    const Component = as || defaultElement[variant];

    const combinedStyles: React.CSSProperties = {
      "--rnx-text-fs": variantStyles[variant].fontSize,
      "--rnx-text-lh": variantStyles[variant].lineHeight,
      "--rnx-text-ff": variantStyles[variant].fontFamily,
      "--rnx-text-fw": weight
        ? `var(--fontWeight-${weight})`
        : variantStyles[variant].fontWeight,
      "--rnx-text-ls": variantStyles[variant].letterSpacing,
      "--rnx-text-tt": variantStyles[variant].textTransform,
      "--rnx-text-color": gradient ? "transparent" : colorMap[color],
      "--rnx-text-align": align || "inherit",
      ...(truncate
        ? {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: maxLines ? "normal" : "nowrap",
          }
        : {}),
      ...(maxLines
        ? {
            display: "-webkit-box",
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }
        : {}),
      ...style,
    } as React.CSSProperties;

    return (
      <Component
        ref={ref}
        className={cn(
          "rnx-text",
          gradient && gradientClasses[gradient],
          className
        )}
        style={combinedStyles}
        {...rest}
      >
        {children}
      </Component>
    );
  }
) as unknown as TextComponent;

Object.assign(Text, { displayName: "Text" });
