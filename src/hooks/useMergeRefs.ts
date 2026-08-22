import { useMemo } from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

/**
 * Merges multiple React refs into a single callback ref, supporting both function refs and ref objects.
 *
 * @param refs - An array of possible React refs to merge.
 * @returns A callback ref that updates all provided refs.
 *
 * @example
 * const mergedRef = useMergeRefs(ref1, ref2);
 * return <div ref={mergedRef} />;
 */
export function useMergeRefs<T>(
  ...refs: PossibleRef<T>[]
): React.RefCallback<T> {
  return useMemo(() => {
    return (node: T) => {
      refs.forEach((ref) => setRef(ref, node));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
