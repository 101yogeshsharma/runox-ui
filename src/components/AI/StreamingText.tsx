"use client";
import { Box } from "../../atoms/Box";

import React, { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

import "./StreamingText.css";

/**
 * Props for the StreamingText component.
 */
export interface StreamingTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  speed?: number;
  showCursor?: boolean;
  cursor?: "pipe" | "block" | "glow";
  onComplete?: () => void;
}

export const StreamingText = ({
  text,
  speed = 10,
  showCursor = true,
  cursor = "pipe",
  onComplete,
  className,
  ...props
}: StreamingTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    setIsFinished(false);

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + (text[i] || ""));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsFinished(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <Box
      as="span"
      className={cn("rnx-streaming-text whitespace-pre-wrap", className)}
      {...props}
    >
      {displayedText}
      {showCursor && !isFinished && (
        <span
          className={cn(
            "rnx-streaming-text__cursor",
            `rnx-streaming-text__cursor--${cursor}`,
          )}
          aria-hidden="true"
        />
      )}
    </Box>
  );
};
