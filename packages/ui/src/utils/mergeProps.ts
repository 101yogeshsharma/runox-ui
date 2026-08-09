import { cn } from "./cn";

type AnyProps = Record<string, any>;

export function mergeProps(
  internalProps: AnyProps,
  consumerProps: AnyProps
): AnyProps {
  const merged: AnyProps = { ...internalProps };

  for (const key of Object.keys(consumerProps)) {
    const internal = internalProps[key];
    const consumer = consumerProps[key];

    if (
      typeof internal === "function" &&
      typeof consumer === "function" &&
      key.startsWith("on")
    ) {
      // Chain event handlers
      merged[key] = (...args: any[]) => {
        internal(...args);
        consumer(...args);
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

  return merged;
}
