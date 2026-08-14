"use client";
import React, { forwardRef, createContext, useContext, useId } from "react";
import { Box } from "../../atoms/Box";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";
import { useControllableState } from "../../hooks";

type AccordionContextType = {
  value: string | string[];
  onValueChange: (value: string) => void;
  accordionId: string;
};

const AccordionContext = createContext<AccordionContextType | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context)
    throw new Error("Accordion components must be used within an Accordion");
  return context;
}

type AccordionContextItemType = {
  value: string;
};

const AccordionItemContext = createContext<AccordionContextItemType | null>(
  null
);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context)
    throw new Error(
      "Accordion components must be used within an AccordionItem"
    );
  return context;
}

export interface AccordionProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
}

const AccordionComponent = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      className,
      type = "single",
      value: valueProp,
      defaultValue,
      onValueChange,
      collapsible = false,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useControllableState<string | string[]>({
      prop: valueProp,
      defaultProp:
        defaultValue !== undefined
          ? defaultValue
          : type === "multiple"
            ? []
            : "",
      onChange: onValueChange,
    });
    const accordionId = useId().replace(/:/g, "");

    const handleValueChange = (itemValue: string) => {
      if (type === "multiple") {
        const arrValue = (Array.isArray(value) ? value : []) as string[];
        if (arrValue.includes(itemValue)) {
          setValue(arrValue.filter((v) => v !== itemValue));
        } else {
          setValue([...arrValue, itemValue]);
        }
      } else {
        const strValue = typeof value === "string" ? value : "";
        if (strValue === itemValue && collapsible) {
          setValue("");
        } else {
          setValue(itemValue);
        }
      }
    };

    return (
      <AccordionContext.Provider
        value={{
          value: value ?? (type === "multiple" ? [] : ""),
          onValueChange: handleValueChange,
          accordionId,
        }}
      >
        <Box ref={ref} className={cn("rnx-accordion", className)} {...props} />
      </AccordionContext.Provider>
    );
  }
);
AccordionComponent.displayName = "Accordion";

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, ...props }, ref) => (
    <AccordionItemContext.Provider value={{ value }}>
      <Box
        ref={ref}
        className={cn("rnx-accordion-item", className)}
        {...props}
      />
    </AccordionItemContext.Provider>
  )
);
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const {
    value: contextValue,
    onValueChange,
    accordionId,
  } = useAccordionContext();
  const { value: itemValue } = useAccordionItemContext();

  const isOpen = Array.isArray(contextValue)
    ? contextValue.includes(itemValue)
    : contextValue === itemValue;

  const triggerId = `rnx-accordion-trigger-${accordionId}-${itemValue}`;
  const contentId = `rnx-accordion-content-${accordionId}-${itemValue}`;

  return (
    <Box className="rnx-accordion-header" role="heading" aria-level={3}>
      <button
        ref={ref}
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        data-state={isOpen ? "open" : "closed"}
        onClick={() => onValueChange(itemValue)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            // Scope to the nearest accordion root to avoid jumping between multiple accordions
            const accordionRoot = (e.currentTarget as HTMLElement).closest(
              ".rnx-accordion"
            );
            if (!accordionRoot) return;
            const allTriggers = Array.from(
              accordionRoot.querySelectorAll<HTMLElement>(
                ":scope > .rnx-accordion-item > .rnx-accordion-header > .rnx-accordion-trigger"
              )
            );
            const idx = allTriggers.indexOf(e.currentTarget);
            const next =
              e.key === "ArrowDown"
                ? allTriggers[(idx + 1) % allTriggers.length]
                : allTriggers[
                    (idx - 1 + allTriggers.length) % allTriggers.length
                  ];
            next?.focus();
          }
        }}
        className={cn("rnx-accordion-trigger", className)}
        {...props}
      >
        {children}
        <ChevronDown className="rnx-accordion-icon" />
      </button>
    </Box>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { value: contextValue, accordionId } = useAccordionContext();
  const { value: itemValue } = useAccordionItemContext();

  const isOpen = Array.isArray(contextValue)
    ? contextValue.includes(itemValue)
    : contextValue === itemValue;

  const triggerId = `rnx-accordion-trigger-${accordionId}-${itemValue}`;
  const contentId = `rnx-accordion-content-${accordionId}-${itemValue}`;

  return (
    <Box
      ref={ref}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      aria-hidden={!isOpen}
      {...(!isOpen ? { inert: "true" } : {})}
      data-state={isOpen ? "open" : "closed"}
      className={cn("rnx-accordion-content", className)}
      {...props}
    >
      <Box className="rnx-accordion-content-inner">
        <Box className="pt-0 pb-4 break-words">{children}</Box>
      </Box>
    </Box>
  );
});
AccordionContent.displayName = "AccordionContent";

export const Accordion = Object.assign(AccordionComponent, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
