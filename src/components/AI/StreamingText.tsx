"use client";
import { Box } from "../../atoms/Box";

import React, { useEffect, useState, forwardRef } from "react";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";

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

export const StreamingText = forwardRef<HTMLSpanElement, StreamingTextProps>(
  (
    {
      text,
      speed = 10,
      showCursor = true,
      cursor = "pipe",
      onComplete,
      className,
      ...props
    },
    ref,
  ) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
      let i = 0;
      setDisplayedText("");
      setIsFinished(false);

      // rAF-driven batching: emits characters based on elapsed time rather than
      // one setState per character. At speed=10ms a long text previously caused
      // 100 re-renders/second; this caps renders at display refresh rate and
      // emits multiple characters per frame when speed allows.
      let lastTick = performance.now();
      let raf: number;

      const tick = (now: number) => {
        const elapsed = now - lastTick;
        if (elapsed >= speed) {
          // How many characters should be visible by now.
          const charsDue = Math.max(1, Math.floor(elapsed / speed));
          i = Math.min(text.length, i + charsDue);
          setDisplayedText(text.slice(0, i));
          lastTick = now;
          if (i >= text.length) {
            setIsFinished(true);
            onComplete?.();
            return;
          }
        }
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);

      return () => cancelAnimationFrame(raf);
    }, [text, speed, onComplete]);

    return (
      <Box
        as="span"
        ref={ref}
        {...rnx({
          component: "StreamingText",
          state: isFinished ? "inactive" : "active",
        })}
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
  },
);
StreamingText.displayName = "StreamingText";
