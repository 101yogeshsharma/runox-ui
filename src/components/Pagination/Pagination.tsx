"use client";
import { Flex } from "../../atoms/Flex";
import React, { forwardRef } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button, ButtonProps } from "../Button";
import { Box } from "../../atoms/Box";
import { Text } from "../../atoms/Text";

export interface PaginationProps extends Omit<
  React.ComponentPropsWithoutRef<"nav">,
  "color"
> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: "sm" | "md" | "lg";
  siblingCount?: number;
  itemClassName?: string;
  activeItemClassName?: string;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
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
      <Flex
        as="nav"
        ref={ref}
        role="navigation"
        aria-label="pagination"
        justify="center"
        className={cn("mx-auto w-full", className)}
        {...props}
      >
        <Flex as="ul" direction="row" align="center" gap="xs">
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
      </Flex>
    );
  }
);

Pagination.displayName = "Pagination";

type PaginationLinkProps = {
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  isIcon?: boolean;
} & Omit<React.ComponentPropsWithoutRef<"button">, "color" | "size">;

export const PaginationLink = ({
  className,
  isActive,
  size = "md",
  isIcon = false,
  ...props
}: PaginationLinkProps) => {
  const iconSizes = {
    sm: "w-8 h-8 p-0",
    md: "w-10 h-10 p-0",
    lg: "w-12 h-12 p-0 text-lg",
  };
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(
        className,
        isIcon && iconSizes[(size as keyof typeof iconSizes) || "md"]
      )}
      {...props}
    />
  );
};
PaginationLink.displayName = "PaginationLink";

export const PaginationPrevious = ({
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
PaginationPrevious.displayName = "PaginationPrevious";

export const PaginationNext = ({
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
PaginationNext.displayName = "PaginationNext";

export const PaginationEllipsis = ({
  className,
  size = "md",
  ...props
}: React.ComponentPropsWithoutRef<"span"> & { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };
  return (
    <Box
      as="span"
      aria-hidden
      className={cn(
        "flex items-center justify-center",
        sizeClasses[size],
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
PaginationEllipsis.displayName = "PaginationEllipsis";
