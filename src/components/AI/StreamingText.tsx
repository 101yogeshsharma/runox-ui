"use client";
import { Box } from "../../atoms/Box";

import React, { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

export interface StreamingTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const StreamingText = ({
  text,
  speed = 10,
  onComplete,
  className,
  ...props
}: StreamingTextProps) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + (text[i] || ""));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <Box as="span" className={cn("whitespace-pre-wrap", className)} {...props}>
      {displayedText}
    </Box>
  );
};
