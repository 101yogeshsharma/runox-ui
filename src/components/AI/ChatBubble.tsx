"use client";
import { Box } from "../../atoms/Box";
import { rnx } from "../../utils/rnx";

import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Bot, User } from "lucide-react";
import { withLoading } from "../../utils/withLoading";

import "./ChatBubble.css";

/**
 * Props for the ChatBubble component.
 */
export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Who sent the message. Rendered as a data attribute and modifier class —
   * does NOT set the ARIA `role` attribute, which stays free for consumers.
   * @default "user"
   */
  speaker?: "user" | "assistant" | "system";
  /** @deprecated Use `speaker` instead. */
  role?: "user" | "assistant" | "system";
  variant?: "solid" | "glass";
  avatar?: React.ReactNode;
}

const ChatBubbleBase = forwardRef<HTMLDivElement, ChatBubbleProps>(
  (
    {
      className,
      speaker,
      role: legacyRole,
      variant = "solid",
      avatar,
      children,
      ...props
    },
    ref,
  ) => {
    if (
      process.env.NODE_ENV !== "production" &&
      legacyRole !== undefined &&
      speaker !== undefined
    ) {
      // Both provided — speaker wins; warn once per surface.
      console.warn(
        "[Runox UI - ChatBubble]: `role` is deprecated, use `speaker` instead.",
      );
    }
    const effectiveSpeaker = speaker ?? legacyRole ?? "user";
    const isUser = effectiveSpeaker === "user";

    return (
      <Box
        ref={ref}
        data-speaker={effectiveSpeaker}
        {...rnx({
          component: "ChatBubble",
          variant,
          state: effectiveSpeaker,
        })}
        className={cn(
          "rnx-chat-bubble",
          `rnx-chat-bubble--${effectiveSpeaker}`,
          variant &&
            variant !== "solid" &&
            `rnx-chat-bubble--variant-${variant}`,
          className,
        )}
        {...props}
      >
        <Box className="rnx-chat-bubble__avatar">
          {avatar ? (
            avatar
          ) : isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </Box>
        <Box
          className={cn(
            "rnx-chat-bubble__content",
            `rnx-chat-bubble__content--${effectiveSpeaker}`,
          )}
        >
          {children}
        </Box>
      </Box>
    );
  },
);
ChatBubbleBase.displayName = "ChatBubble";
export const ChatBubble = withLoading(ChatBubbleBase);
