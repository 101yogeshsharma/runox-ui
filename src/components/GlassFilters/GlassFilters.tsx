"use client";
import React from "react";

export function GlassFilters() {
  return (
    <>
      <style suppressHydrationWarning>{`
        /* 
          These classes MUST be injected via an inline style tag in the same document 
          as the SVG filters, otherwise modern frameworks (like Next.js) will resolve 
          url(#id) relative to their external compiled CSS files, breaking the effect.
        */
        .rnx-liquid-glass--chromatic {
          backdrop-filter: url(#rnx-chromatic-glass) !important;
          -webkit-backdrop-filter: url(#rnx-chromatic-glass) !important;
        }

        .rnx-liquid-glass--ripple {
          backdrop-filter: url(#rnx-ripple-glass) !important;
          -webkit-backdrop-filter: url(#rnx-ripple-glass) !important;
        }
      `}</style>

      <svg
        className="absolute w-0 h-0 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          {/* Chromatic Aberration Glass Filter (includes blur and saturate) */}
          <filter
            id="rnx-chromatic-glass"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            {/* Base Blur and Saturate */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="2 0 0 0 0  0 2 0 0 0  0 0 2 0 0  0 0 0 1 0" result="saturate" />

            {/* Extract and offset RED channel */}
            <feOffset dx="6" dy="0" in="saturate" result="red-offset" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              in="red-offset"
              result="red-channel"
            />

            {/* Extract and offset GREEN channel */}
            <feOffset dx="-3" dy="5.2" in="saturate" result="green-offset" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              in="green-offset"
              result="green-channel"
            />

            {/* Extract and offset BLUE channel */}
            <feOffset dx="-3" dy="-5.2" in="saturate" result="blue-offset" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              in="blue-offset"
              result="blue-channel"
            />

            {/* Recombine channels */}
            <feBlend
              mode="screen"
              in="red-channel"
              in2="green-channel"
              result="rg-blend"
            />
            <feBlend
              mode="screen"
              in="rg-blend"
              in2="blue-channel"
              result="chromatic-fringe"
            />
          </filter>

          {/* Liquid Ripple Glass Filter (includes blur and saturate) */}
          <filter
            id="rnx-ripple-glass"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            {/* Base Blur and Saturate */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1.5 0 0 0 0  0 1.5 0 0 0  0 0 1.5 0 0  0 0 0 1 0" result="saturate" />
            
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="saturate"
              in2="noise"
              scale="40"
              xChannelSelector="R"
              yChannelSelector="G"
              result="ripple"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}

GlassFilters.displayName = "GlassFilters";
