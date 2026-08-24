import { cn } from "./cn";

type AnyProps = Record<string, any>;

interface MergeProps {
  <T extends AnyProps, U extends AnyProps>(a: T, b: U): T & U;
  <T extends AnyProps[]>(...args: T): AnyProps;
}

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
function mergeSingleKey(key: string, internal: any, consumer: any): any {
  if (
    typeof internal === "function" &&
    typeof consumer === "function" &&
    key.startsWith("on")
  ) {
    return (...fnArgs: any[]) => {
      internal(...fnArgs);
      consumer(...fnArgs);
    };
  }
  if (key === "className") {
    return cn(internal, consumer);
  }
  if (key === "style") {
    return { ...internal, ...consumer };
  }
  if (key === "aria-describedby" || key === "aria-labelledby") {
    return [internal, consumer].filter(Boolean).join(" ") || undefined;
  }
  return consumer !== undefined ? consumer : internal;
}

export const mergeProps: MergeProps = (...args: AnyProps[]): AnyProps => {
  const merged: AnyProps = {};

  for (const props of args) {
    if (!props) continue;

    for (const key of Object.keys(props)) {
      merged[key] = mergeSingleKey(key, merged[key], props[key]);
    }
  }

  return merged;
};
