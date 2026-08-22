import { cn } from "./cn";

type AnyProps = Record<string, any>;

/**
 * Merges two or more prop objects, combining event handlers, classNames, styles,
 * and aria attributes. Consumer props take precedence over internal props.
 * @example
 * const merged = mergeProps(
 *   { onClick: internalHandler, className: 'base' },
 *   { onClick: userHandler, className: 'custom' }
 * );
 * // merged.onClick calls both handlers; merged.className is 'base custom'
 */
export function mergeProps<T extends AnyProps, U extends AnyProps>(a: T, b: U): T & U;
export function mergeProps<T extends AnyProps[]>(...args: T): AnyProps;
export function mergeProps(...args: AnyProps[]): AnyProps {
  const merged: AnyProps = {};

  for (const props of args) {
    if (!props) continue;

    for (const key of Object.keys(props)) {
      const internal = merged[key];
      const consumer = props[key];

      if (
        typeof internal === "function" &&
        typeof consumer === "function" &&
        key.startsWith("on")
      ) {
        // Chain event handlers
        merged[key] = (...fnArgs: any[]) => {
          internal(...fnArgs);
          consumer(...fnArgs);
        };
      } else if (key === "className") {
        merged[key] = cn(internal, consumer);
      } else if (key === "style") {
        merged[key] = { ...internal, ...consumer };
      } else if (key === "aria-describedby" || key === "aria-labelledby") {
        merged[key] = [internal, consumer].filter(Boolean).join(" ") || undefined;
      } else {
        merged[key] = consumer !== undefined ? consumer : internal;
      }
    }
  }

  return merged;
}
