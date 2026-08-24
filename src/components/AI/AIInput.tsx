"use client";
import "./AIInput.css";
import { Box } from "../../atoms/Box";

import React, { forwardRef, useRef } from "react";
import { cn } from "../../utils/cn";
import { CornerDownLeft, Paperclip, Mic } from "lucide-react";
import { withLoading } from "../../utils/withLoading";


/**
 * Props for the AIInput component.
 */
export interface AIInputProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onSubmit"
> {
  variant?: "solid" | "glass" | "filled";
  onValueSubmit?: (value: string) => void;
  onAttach?: () => void;
  onMic?: () => void;
}

const AIInputBase = forwardRef<HTMLTextAreaElement, AIInputProps>(
  (
    {
      className,
      variant = "solid",
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
          "rnx-ai-input",
          variant && variant !== "solid" && `rnx-ai-input--variant-${variant}`,
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
          className="rnx-ai-input__textarea"
          placeholder={placeholder}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          {...props}
        />
        <Box className="rnx-ai-input-toolbar">
          <Box className="rnx-ai-input-actions">
            {onAttach && (
              <button
                type="button"
                onClick={onAttach}
                disabled={disabled}
                className="rnx-ai-input-action-btn"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            )}
            {onMic && (
              <button
                type="button"
                onClick={onMic}
                disabled={disabled}
                className="rnx-ai-input-action-btn"
                aria-label="Use microphone"
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
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
            className="rnx-ai-input-submit-btn"
            aria-label="Submit"
          >
            <CornerDownLeft className="h-4 w-4" />
          </button>
        </Box>
      </Box>
    );
  }
);
AIInputBase.displayName = "AIInput";
export const AIInput = withLoading(AIInputBase);
