"use client";
import React from "react";
import { m, HTMLMotionProps } from "framer-motion";

export interface ScaleInProps extends HTMLMotionProps<"div"> {
  duration?: number;
  delay?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  duration = 0.3,
  delay = 0,
  ...props
}) => {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </m.div>
  );
};
