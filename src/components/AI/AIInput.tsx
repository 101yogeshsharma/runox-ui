"use client";
import "./AIInput.css";
import { Box } from "../../atoms/Box";

import React, { forwardRef, useRef } from "react";
import { cn } from "../../utils/cn";
import { CornerDownLeft, Paperclip, Mic } from "lucide-react";

export interface AIInputProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onSubmit"
> {
  onValueSubmit?: (value: string) => void;
  onAttach?: () => void;
  onMic?: () => void;
}

export const AIInput = forwardRef<HTMLTextAreaElement, AIInputProps>(
  (
    {
      className,
      onValueSubmit,
      onAttach,
      onMic,
      disabled,
      placeholder = "Ask me anything...",
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const getValue = () =>
      (props.value !== undefined
        ? String(props.value)
        : internalRef.current?.value) || "";

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (internalRef.current) {
        internalRef.current.style.height = "auto";
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.style.height = "auto";
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    }, [props.value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ignore Enter during IME composition (CJK input methods use Enter to confirm a character)
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        const val = getValue();
        if (val && onValueSubmit) {
          onValueSubmit(val);
        }
      }
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    return (
      <Box
        className={cn(
          "bg-background focus-within:ring-primary relative flex w-full flex-col overflow-hidden rounded-xl border shadow-sm focus-within:ring-1",
          className
        )}
      >
        <textarea
          ref={(node) => {
            internalRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className="placeholder:text-muted-foreground rnx-ai-input__textarea w-full resize-none bg-transparent px-4 py-4 pe-12 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={placeholder}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          {...props}
        />
        <Box className="flex items-center justify-between p-2">
          <Box className="flex items-center gap-1">
            <button
              type="button"
              onClick={onAttach}
              disabled={disabled}
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              <Paperclip className="h-4 w-4" />
              <Box as="span" className="sr-only">
                Attach file
              </Box>
            </button>
            <button
              type="button"
              onClick={onMic}
              disabled={disabled}
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              <Mic className="h-4 w-4" />
              <Box as="span" className="sr-only">
                Use microphone
              </Box>
            </button>
          </Box>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const val = getValue();
              if (val && onValueSubmit) {
                onValueSubmit(val);
              }
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          >
            <CornerDownLeft className="h-4 w-4" />
            <Box as="span" className="sr-only">
              Submit
            </Box>
          </button>
        </Box>
      </Box>
    );
  }
);
AIInput.displayName = "AIInput";
