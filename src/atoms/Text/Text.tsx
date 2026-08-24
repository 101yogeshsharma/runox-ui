import React from "react";
import { cn } from "../../utils/cn";
import { withLoading } from "../../utils/withLoading";
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

export type TextTracking =
  "tighter" | "tight" | "normal" | "wide" | "wider" | "widest";

import type { PolymorphicComponentPropsWithRef } from "../../utils/types";

/**
 * Props for the Text component.
 */
export interface TextBaseProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextWeight;
  align?: TextAlign;
  tracking?: TextTracking;
  truncate?: boolean;
  maxLines?: number;
  gradient?: "primary" | "info" | "success" | "warning" | "danger" | "ai";
  muted?: boolean;
  subtle?: boolean;
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}

export type TextProps<C extends React.ElementType> =
  PolymorphicComponentPropsWithRef<C, TextBaseProps>;

type TextComponent = <C extends React.ElementType = "p">(
  props: TextProps<C>,
) => React.ReactElement | null;

const variantStyles: Record<TextVariant, React.CSSProperties> = {
  h1: {
    fontSize: "calc(var(--fontSize-4xl-0, 2.25rem) * var(--rnx-text-scale, 1))",
    lineHeight:
      "calc(var(--fontSize-4xl-1-lineHeight, 2.5rem) * var(--rnx-text-scale, 1))",
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-medium, 500)",
    letterSpacing: "var(--letterSpacing-tight, -0.02em)",
  },
  h2: {
    fontSize: "calc(var(--fontSize-2xl-0, 1.5rem) * var(--rnx-text-scale, 1))",
    lineHeight:
      "calc(var(--fontSize-2xl-1-lineHeight, 2rem) * var(--rnx-text-scale, 1))",
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-medium, 500)",
    letterSpacing: "var(--letterSpacing-tight, -0.02em)",
  },
  h3: {
    fontSize: "calc(var(--fontSize-lg-0, 1.125rem) * var(--rnx-text-scale, 1))",
    lineHeight:
      "calc(var(--fontSize-lg-1-lineHeight, 1.75rem) * var(--rnx-text-scale, 1))",
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-medium, 500)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
  h4: {
    fontSize: "calc(var(--fontSize-md-0, 1rem) * var(--rnx-text-scale, 1))",
    lineHeight:
      "calc(var(--fontSize-md-1-lineHeight, 1.5rem) * var(--rnx-text-scale, 1))",
    fontFamily: "var(--font-heading)",
    fontWeight: "var(--fontWeight-medium, 500)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
  body: {
    fontSize: "calc(var(--fontSize-base-0, 1rem) * var(--rnx-text-scale, 1))",
    lineHeight:
      "calc(var(--fontSize-base-1-lineHeight, 1.6rem) * var(--rnx-text-scale, 1))",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fontWeight-normal, 400)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
  "body-sm": {
    fontSize: "calc(var(--fontSize-sm-0, 0.875rem) * var(--rnx-text-scale, 1))",
    lineHeight:
      "calc(var(--fontSize-sm-1-lineHeight, 1.25rem) * var(--rnx-text-scale, 1))",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fontWeight-normal, 400)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
  caption: {
    fontSize: "calc(var(--fontSize-xs-0, 0.75rem) * var(--rnx-text-scale, 1))",
    lineHeight:
      "calc(var(--fontSize-xs-1-lineHeight, 1rem) * var(--rnx-text-scale, 1))",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fontWeight-normal, 400)",
    letterSpacing: "var(--letterSpacing-normal, 0em)",
  },
  overline: {
    fontSize:
      "calc(var(--fontSize-2xs-0, 0.625rem) * var(--rnx-text-scale, 1))",
    lineHeight:
      "calc(var(--fontSize-2xs-1-lineHeight, 0.875rem) * var(--rnx-text-scale, 1))",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fontWeight-bold, 700)",
    letterSpacing: "var(--letterSpacing-widest, 0.15em)",
    textTransform: "uppercase",
  },
  code: {
    fontSize:
      "calc(var(--fontSize-sm-0, 0.8125rem) * var(--rnx-text-scale, 1))",
    lineHeight:
      "calc(var(--fontSize-sm-1-lineHeight, 1.25rem) * var(--rnx-text-scale, 1))",
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
  primary: "var(--foreground)",
  secondary: "var(--muted-foreground)",
  brand: "var(--primary)",
  success: "var(--success)",
  danger: "var(--destructive)",
  warning: "var(--warning)",
  inherit: "inherit",
};

function inferVariant(as?: React.ElementType): TextVariant {
  if (!as) return "body";
  if (as === "h1") return "h1";
  if (as === "h2") return "h2";
  if (as === "h3") return "h3";
  if (as === "h4") return "h4";
  if (as === "code") return "code";
  return "body";
}

const TextBase = React.forwardRef(
  (props: TextProps<React.ElementType>, ref: React.Ref<unknown>) => {
    const {
      children,
      variant: explicitVariant,
      color = "inherit",
      weight,
      align,
      tracking,
      truncate = false,
      maxLines,
      gradient,
      muted,
      subtle,
      strong,
      italic,
      underline,
      strikethrough,
      as,
      style,
      className,
      ...rest
    } = props;

    const variant = explicitVariant || inferVariant(as);
    const Component = as || defaultElement[variant];

    let textColor = colorMap[color];
    if (gradient) {
      textColor = "transparent";
    } else if (muted) {
      textColor = "var(--muted-foreground)";
    }

    const combinedStyles = React.useMemo(
      () =>
        ({
          "--rnx-text-fs": variantStyles[variant].fontSize,
          "--rnx-text-lh": variantStyles[variant].lineHeight,
          "--rnx-text-ff": variantStyles[variant].fontFamily,
          "--rnx-text-fw": weight
            ? `var(--fontWeight-${weight})`
            : variantStyles[variant].fontWeight,
          "--rnx-text-ls": variantStyles[variant].letterSpacing,
          "--rnx-text-tt": variantStyles[variant].textTransform,
          "--rnx-text-color": textColor,
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
        }) as React.CSSProperties,
      [variant, weight, textColor, align, truncate, maxLines, style],
    );

    return (
      <Component
        ref={ref}
        className={cn(
          "rnx-text",
          gradient && `rnx-text--gradient-${gradient}`,
          tracking && `rnx-text--tracking-${tracking}`,
          muted && "rnx-text--muted",
          subtle && "rnx-text--subtle",
          strong && "rnx-text--strong",
          italic && "rnx-text--italic",
          underline && "rnx-text--underline",
          strikethrough && "rnx-text--strikethrough",
          className,
        )}
        style={combinedStyles}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);

TextBase.displayName = "Text";
export const Text = withLoading(TextBase) as unknown as TextComponent;
