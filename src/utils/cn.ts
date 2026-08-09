/**
 * A zero-dependency utility for conditional class names.
 * Replaces clsx and tailwind-merge.
 */
type ClassValue = any;

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      if (input.length) {
        const inner = cn(...input);
        if (inner) classes.push(inner);
      }
    } else if (typeof input === "object") {
      for (const key in input) {
        if (input[key]) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}
