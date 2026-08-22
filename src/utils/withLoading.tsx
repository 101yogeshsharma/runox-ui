import React from "react";
import { cn } from "./cn";

export interface WithLoadingProps {
  isLoading?: boolean;
}

/**
 * A Higher-Order Component that adds a universal `isLoading` prop.
 * If `isLoading` is true, it renders the `SkeletonComponent` if provided,
 * otherwise it renders the component with a universal shimmer overlay class.
 */
export function withLoading<T extends React.ComponentType<any>>(
  WrappedComponent: T,
  SkeletonComponent?: React.ComponentType<any>
) {
  const ComponentWithLoading = React.forwardRef<unknown, React.ComponentProps<T> & WithLoadingProps>(
    (props, ref) => {
      const { isLoading, ...rest } = props;

      if (isLoading) {
        if (SkeletonComponent) {
          return <SkeletonComponent {...(rest as any)} />;
        }
        return (
          <WrappedComponent
            {...(rest as any)}
            ref={ref}
            className={cn((rest as any).className, "rnx-is-loading")}
            data-loading="true"
            aria-busy={true}
          />
        );
      }

      return <WrappedComponent {...(rest as any)} ref={ref} />;
    }
  );

  ComponentWithLoading.displayName = `withLoading(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  // Return the component while preserving its original typing (e.g. for polymorphic components)
  // and appending the WithLoadingProps.
  return ComponentWithLoading as unknown as T;
}
