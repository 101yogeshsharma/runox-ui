"use client";
import { Flex } from "../../atoms/Flex";
import { Box } from "../../atoms/Box";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  ChevronRight,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react";
import { cn } from "../../utils/cn";
import "./TreeView.css";
import { rnx } from "../../utils/rnx";

interface TreeContextType {
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
}

const TreeContext = createContext<TreeContextType | null>(null);

export const useTreeContext = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("Tree components must be used within a Tree Provider");
  }
  return context;
};

export interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedId?: string | null;
  defaultSelectedId?: string;
  onSelectChange?: (id: string) => void;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  children: React.ReactNode;
}

const TreeRoot = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      className,
      selectedId,
      defaultSelectedId,
      onSelectChange,
      expandedIds,
      defaultExpandedIds = [],
      onExpandedChange,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
      defaultSelectedId || null,
    );
    const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(
      new Set(defaultExpandedIds),
    );

    const currentSelectedId =
      selectedId !== undefined ? selectedId : internalSelectedId;

    // Memoize the Set so its reference is stable between renders — without this,
    // `new Set(expandedIds)` on every render would break useMemo/useCallback deps.
    const controlledExpandedSet = useMemo(
      () => (expandedIds !== undefined ? new Set(expandedIds) : null),

      // JSON.stringify gives a stable dep when the array contents haven't changed
      // eslint-disable-next-line react-hooks/exhaustive-deps -- content-hash dep is intentional; the raw array identity changes every render
      [expandedIds ? JSON.stringify([...expandedIds].sort()) : null],
    );
    const currentExpandedIds = controlledExpandedSet ?? internalExpandedIds;

    const handleSelect = useCallback(
      (id: string) => {
        if (selectedId === undefined) {
          setInternalSelectedId(id);
        }
        onSelectChange?.(id);
      },
      [selectedId, onSelectChange],
    );

    const toggleExpanded = useCallback(
      (id: string) => {
        const nextSet = new Set(currentExpandedIds);
        if (nextSet.has(id)) {
          nextSet.delete(id);
        } else {
          nextSet.add(id);
        }

        if (expandedIds === undefined) {
          setInternalExpandedIds(nextSet);
        }
        onExpandedChange?.(Array.from(nextSet));
      },
      [currentExpandedIds, expandedIds, onExpandedChange],
    );

    const contextValue = useMemo(
      () => ({
        selectedId: currentSelectedId,
        onSelect: handleSelect,
        expandedIds: currentExpandedIds,
        toggleExpanded,
      }),
      [currentSelectedId, handleSelect, currentExpandedIds, toggleExpanded],
    );

    return (
      <TreeContext.Provider value={contextValue}>
        <Flex
          {...rnx({ component: "TreeView" })}
          ref={ref}
          role="tree"
          direction="col"
          fullWidth
          className={cn("rnx-treeview", className)}
          onKeyDown={(e) => {
            if (
              ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(
                e.key,
              )
            ) {
              e.preventDefault();
              const focusableItems = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>(
                  '[role="treeitem"] > [tabindex="0"]',
                ),
              ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0);

              const active = document.activeElement as HTMLElement;
              const idx = focusableItems.indexOf(active);

              if (idx === -1) {
                if (focusableItems.length) focusableItems[0].focus();
                return;
              }

              if (e.key === "ArrowDown") {
                focusableItems[idx + 1]?.focus();
              } else if (e.key === "ArrowUp") {
                focusableItems[idx - 1]?.focus();
              } else if (e.key === "ArrowRight") {
                const treeItem = active.closest('[role="treeitem"]');
                if (treeItem?.getAttribute("aria-expanded") === "false") {
                  active.click();
                } else {
                  focusableItems[idx + 1]?.focus();
                }
              } else if (e.key === "ArrowLeft") {
                const treeItem = active.closest('[role="treeitem"]');
                if (treeItem?.getAttribute("aria-expanded") === "true") {
                  active.click();
                } else {
                  const parentGroup = treeItem?.closest('[role="group"]');
                  const parentTreeItem =
                    parentGroup?.closest('[role="treeitem"]');
                  const parentFocusable =
                    parentTreeItem?.querySelector<HTMLElement>(
                      ':scope > [tabindex="0"]',
                    );
                  if (parentFocusable) parentFocusable.focus();
                }
              }
            }
            props.onKeyDown?.(e as any);
          }}
          {...props}
        >
          {children}
        </Flex>
      </TreeContext.Provider>
    );
  },
);
TreeRoot.displayName = "TreeView";

export interface TreeFolderProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  openIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const TreeFolder = React.forwardRef<HTMLDivElement, TreeFolderProps>(
  ({ className, value, label, icon, openIcon, children, ...props }, ref) => {
    const { expandedIds, toggleExpanded, selectedId, onSelect } =
      useTreeContext();
    const isExpanded = expandedIds.has(value);
    const isSelected = selectedId === value;

    return (
      <Flex
        direction="col"
        ref={ref}
        role="treeitem"
        aria-expanded={isExpanded}
        className={className}
        {...props}
      >
        <Flex
          align="center"
          className={cn(
            "rnx-treeview-node",
            isSelected && "rnx-treeview-node--selected",
          )}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              toggleExpanded(value);
              onSelect(value);
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded(value);
            onSelect(value);
          }}
        >
          <ChevronRight
            className={cn(
              "rnx-treeview-chevron",
              isExpanded && "rnx-treeview-chevron--expanded",
            )}
          />
          <Box className="rnx-treeview-icon">
            {isExpanded
              ? openIcon || icon || <FolderOpenIcon className="h-4 w-4" />
              : icon || <FolderIcon className="h-4 w-4" />}
          </Box>
          <Box as="span" className="truncate">
            {label}
          </Box>
        </Flex>
        <div
          className={cn(
            "rnx-treeview-collapse",
            isExpanded
              ? "rnx-treeview-collapse--expanded"
              : "rnx-treeview-collapse--collapsed",
          )}
        >
          <div className="rnx-treeview-collapse-inner">
            <Box role="group" className="rnx-treeview-content">
              {children}
            </Box>
          </div>
        </div>
      </Flex>
    );
  },
);
TreeFolder.displayName = "TreeView.Folder";

export interface TreeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  ({ className, value, label, icon, ...props }, ref) => {
    const { selectedId, onSelect } = useTreeContext();
    const isSelected = selectedId === value;

    return (
      <Flex
        align="center"
        ref={ref}
        role="treeitem"
        className={cn(
          "rnx-treeview-node",
          isSelected && "rnx-treeview-node--selected",
          className,
        )}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onSelect(value);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(value);
        }}
        {...props}
      >
        <Box className="rnx-treeview-spacer" />
        <Box className="rnx-treeview-icon">
          {icon || <FileIcon className="h-4 w-4" />}
        </Box>
        <Box as="span" className="truncate">
          {label}
        </Box>
      </Flex>
    );
  },
);
TreeItem.displayName = "TreeView.Item";

export const Tree = Object.assign(TreeRoot, {
  Folder: TreeFolder,
  Item: TreeItem,
});

export const TreeView = Tree;
