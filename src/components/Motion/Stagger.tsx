"use client";
import React from "react";
import { m, HTMLMotionProps } from "framer-motion";

export interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
  delayChildren?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  ...props
}) => {
  return (
    <m.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delayChildren,
          },
        },
      }}
      {...props}
    >
      {children}
    </m.div>
  );
};

export interface StaggerItemProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  direction = "up",
  distance = 20,
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
      variants={{
        hidden: { opacity: 0, x: offset.x, y: offset.y },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { ease: [0.16, 1, 0.3, 1], duration: 0.4 },
        },
      }}
      {...props}
    >
      {children}
    </m.div>
  );
};
