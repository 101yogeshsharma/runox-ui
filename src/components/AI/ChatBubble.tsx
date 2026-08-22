"use client";
import { Box } from "../../atoms/Box";

import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Bot, User } from "lucide-react";
import { withLoading } from "../../utils/withLoading";


import "./ChatBubble.css";

/**
 * Props for the ChatBubble component.
 */
export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: "user" | "assistant" | "system";
  variant?: "solid" | "glass";
  avatar?: React.ReactNode;
}

const ChatBubbleBase = forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, role = "user", variant = "solid", avatar, children, ...props }, ref) => {
    const isUser = role === "user";

    return (
      <Box
        ref={ref}
        className={cn(
          "rnx-chat-bubble",
          `rnx-chat-bubble--${role}`,
          variant && variant !== "solid" && `rnx-chat-bubble--variant-${variant}`,
          className
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
            `rnx-chat-bubble__content--${role}`
          )}
        >
          {children}
        </Box>
      </Box>
    );
  }
);
ChatBubbleBase.displayName = "ChatBubble";
export const ChatBubble = withLoading(ChatBubbleBase);
