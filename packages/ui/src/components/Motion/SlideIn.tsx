"use client";
import React from "react";
import { m, HTMLMotionProps } from "framer-motion";

export interface SlideInProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  delay?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = "up",
  distance = 20,
  duration = 0.4,
  delay = 0,
  ...props
}) => {
  const getInitialOffset = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      default:
        return { y: distance, x: 0 };
    }
  };

  const offset = getInitialOffset();

  return (
    <m.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: offset.x, y: offset.y }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </m.div>
  );
};
