"use client";
import { Flex } from "../../atoms/Flex";
import React, { forwardRef } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../Button";
import { Box } from "../../atoms/Box";
import { Text } from "../../atoms/Text";
import { withLoading } from "../../utils/withLoading";
import { rnx } from "../../utils/rnx";


import "./Pagination.css";

/**
 * Props for the Pagination component.
 */
export interface PaginationProps extends Omit<
  React.ComponentPropsWithoutRef<"nav">,
  "color"
> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: "default" | "pills" | "bordered" | "glass";
  size?: "sm" | "md" | "lg";
  siblingCount?: number;
  itemClassName?: string;
  activeItemClassName?: string;
}

const PaginationBase = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      variant = "default",
      size = "md",
      siblingCount = 1,
      itemClassName,
      activeItemClassName,
      className,
      ...props
    },
    ref
  ) => {
    const getPages = () => {
      const range = (start: number, end: number) => {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      };

      if (totalPages <= siblingCount * 2 + 5) {
        return range(1, totalPages);
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(
        currentPage + siblingCount,
        totalPages
      );

      const shouldShowLeftDots = leftSiblingIndex > 3;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount;
        const leftRange = range(1, leftItemCount);
        return [...leftRange, "...", totalPages];
      }

      if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblingCount;
        const rightRange = range(totalPages - rightItemCount + 1, totalPages);
        return [1, "...", ...rightRange];
      }

      if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = range(leftSiblingIndex, rightSiblingIndex);
        return [1, "...", ...middleRange, "...", totalPages];
      }
      return [];
    };

    return (
      <Box
        as="nav"
        ref={ref}
        role="navigation"
        aria-label="pagination"
        className={cn(
          "rnx-pagination flex justify-center",
          variant && variant !== "default" && `rnx-pagination--variant-${variant}`,
          className
        )}
        {...rnx({ component: 'Pagination' })}
        {...props}
      >
        <Flex as="ul" direction="row" align="center" gap="xs" className="rnx-pagination-list">
          <Box as="li">
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              size={size}
              className={itemClassName}
            />
          </Box>

          {getPages().map((page, index) => {
            if (page === "...") {
              return (
                <Box as="li" key={`ellipsis-${index}`}>
                  <PaginationEllipsis size={size} />
                </Box>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <Box as="li" key={`page-${index}-${page}`}>
                <PaginationLink
                  isActive={isCurrent}
                  onClick={() => onPageChange(page as number)}
                  size={size}
                  isIcon
                  className={cn(
                    itemClassName,
                    isCurrent && activeItemClassName
                  )}
                >
                  {page}
                </PaginationLink>
              </Box>
            );
          })}

          <Box as="li">
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || totalPages === 0}
              size={size}
              className={itemClassName}
            />
          </Box>
        </Flex>
      </Box>
    );
  }
);

PaginationBase.displayName = "Pagination";
const PaginationWithLoading = withLoading(PaginationBase);

type PaginationLinkProps = {
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  isIcon?: boolean;
} & Omit<React.ComponentPropsWithoutRef<"button">, "color" | "size">;

const PaginationLink = ({
  className,
  isActive,
  size = "md",
  isIcon = false,
  ...props
}: PaginationLinkProps) => {
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(
        className,
        isIcon && `rnx-pagination-icon--${size}`
      )}
      {...props}
    />
  );
};
PaginationLink.displayName = "Pagination.Link";

const PaginationPrevious = ({
  className,
  size = "md",
  ...props
}: React.ComponentPropsWithoutRef<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size={size}
    className={cn("gap-1 ps-2.5", className)}
    {...props}
  >
    <ChevronLeft className={cn("h-4 w-4", size === "lg" && "h-5 w-5")} />
    <Text as="span" variant="body-sm">
      Previous
    </Text>
  </PaginationLink>
);
PaginationPrevious.displayName = "Pagination.Previous";

const PaginationNext = ({
  className,
  size = "md",
  ...props
}: React.ComponentPropsWithoutRef<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size={size}
    className={cn("gap-1 pe-2.5", className)}
    {...props}
  >
    <Text as="span" variant="body-sm">
      Next
    </Text>
    <ChevronRight className={cn("h-4 w-4", size === "lg" && "h-5 w-5")} />
  </PaginationLink>
);
PaginationNext.displayName = "Pagination.Next";

const PaginationEllipsis = ({
  className,
  size = "md",
  ...props
}: React.ComponentPropsWithoutRef<"span"> & { size?: "sm" | "md" | "lg" }) => {
  return (
    <Box
      as="span"
      aria-hidden
      className={cn(
        "flex items-center justify-center",
        `rnx-pagination-ellipsis--${size}`,
        className
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <Text as="span" className="sr-only">
        More pages
      </Text>
    </Box>
  );
};
PaginationEllipsis.displayName = "Pagination.Ellipsis";

export const Pagination = Object.assign(PaginationWithLoading, {
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
});
