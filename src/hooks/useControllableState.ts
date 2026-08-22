import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Parameters for the useControllableState hook.
 *
 * @property prop - The controlled value passed from the parent.
 * @property defaultProp - The initial default value for uncontrolled state.
 * @property onChange - Callback invoked when the value changes.
 */
export type UseControllableStateParams<T> = {
  prop?: T;
  defaultProp?: T;
  onChange?: (state: T) => void;
};

/**
 * Manages component state that can be controlled externally or used as uncontrolled.
 *
 * @param params - The controllable state parameters.
 * @returns A tuple containing the current state value and a state setter function.
 *
 * @example
 * const [value, setValue] = useControllableState({
 *   prop: props.value,
 *   defaultProp: props.defaultValue,
 *   onChange: props.onChange
 * });
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>) {
  const [uncontrolledProp, setUncontrolledProp] = useState<T | undefined>(
    defaultProp
  );
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;

  const handleChange = useCallbackRef(onChange);

  // Always mirrors the latest uncontrolledProp to prevent stale closures
  // when setValue is called multiple times before the next render.
  const uncontrolledPropRef = useRef(uncontrolledProp);
  uncontrolledPropRef.current = uncontrolledProp;

  const setValue = useCallback(
    (nextValue: T | ((prevState: T | undefined) => T)) => {
      if (isControlled) {
        const setter = nextValue as (prevState: T | undefined) => T;
        const newValue =
          typeof nextValue === "function" ? setter(prop) : nextValue;
        if (newValue !== prop) handleChange(newValue);
      } else {
        // Read from ref so chained functional updates use fresh state,
        // not a stale closure snapshot from the last render.
        const setter = nextValue as (prevState: T | undefined) => T;
        const newValue =
          typeof nextValue === "function"
            ? setter(uncontrolledPropRef.current)
            : nextValue;
        uncontrolledPropRef.current = newValue;
        setUncontrolledProp(newValue);
        handleChange(newValue);
      }
    },
    [isControlled, prop, handleChange]
  );

  return [value, setValue] as const;
}

function useCallbackRef<T extends (...args: any[]) => any>(
  callback: T | undefined
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args: any[]) => {
      return callbackRef.current?.(...args);
    }) as T,
    []
  );
}
