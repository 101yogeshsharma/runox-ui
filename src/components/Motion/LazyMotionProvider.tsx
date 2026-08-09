"use client";

import React, { ReactNode } from "react";
import { LazyMotion, domAnimation } from "framer-motion";

export interface LazyMotionProviderProps {
  children: ReactNode;
}

export function LazyMotionProvider({ children }: LazyMotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
