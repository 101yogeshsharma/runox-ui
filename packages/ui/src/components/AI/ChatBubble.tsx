"use client";
import { Box } from "../../atoms/Box";

import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Bot, User } from "lucide-react";

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: "user" | "assistant" | "system";
  avatar?: React.ReactNode;
}

export const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, role = "user", avatar, children, ...props }, ref) => {
    const isUser = role === "user";

    return (
      <Box
        ref={ref}
        className={cn(
          "flex w-full gap-4 py-4",
          isUser ? "flex-row-reverse" : "flex-row",
          className
        )}
        {...props}
      >
        <Box className="bg-background flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow select-none">
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
            "flex max-w-4/5 flex-col gap-2 rounded-lg px-4 py-3 text-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {children}
        </Box>
      </Box>
    );
  }
);
ChatBubble.displayName = "ChatBubble";
