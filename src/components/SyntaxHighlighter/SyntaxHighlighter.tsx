"use client";
import "./SyntaxHighlighter.css";
import { Box } from "../../atoms/Box";
import { Flex } from "../../atoms/Flex";
import { Text } from "../../atoms/Text";

import React, { useState } from "react";
import { Highlight, themes, Language } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../Button";
import { rnx } from "../../utils/rnx";
// Uses: Button

/**
 * Props for the SyntaxHighlighter component.
 */
export interface SyntaxHighlighterProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language: Language;
  showLineNumbers?: boolean;
  withHeader?: boolean;
}

export const SyntaxHighlighter = React.forwardRef<
  HTMLDivElement,
  SyntaxHighlighterProps
>(
  (
    {
      code,
      language,
      showLineNumbers = false,
      withHeader = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [isCopied, setIsCopied] = useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    const copyToClipboard = async () => {
      if (!navigator.clipboard) {
        console.warn("Clipboard API not available in this context.");
        return;
      }
      try {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy!", err);
      }
    };

    const [isDark, setIsDark] = useState(true);

    React.useEffect(() => {
      if (typeof window === "undefined") return;
      const checkTheme = () => {
        const root = document.documentElement;
        const theme = root.dataset.theme;
        if (theme === "dark") {
          setIsDark(true);
        } else if (theme === "light") {
          setIsDark(false);
        } else {
          setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
        }
      };
      checkTheme();
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return () => observer.disconnect();
    }, []);

    return (
      <Box
        {...rnx({ component: "SyntaxHighlighter" })}
        className={cn("rnx-syntax-highlighter", className)}
        ref={ref}
        {...props}
      >
        {withHeader && (
          <Flex align="center" className="rnx-syntax-highlighter-header">
            <Box className="rnx-syntax-highlighter-controls">
              <Box className="rnx-syntax-highlighter-dot rnx-syntax-highlighter-dot--destructive" />
              <Box className="rnx-syntax-highlighter-dot rnx-syntax-highlighter-dot--warning" />
              <Box className="rnx-syntax-highlighter-dot rnx-syntax-highlighter-dot--success" />
            </Box>
            <Box className="rnx-syntax-highlighter-lang-wrapper">
              <Text className="rnx-syntax-highlighter-lang">{language}</Text>
            </Box>
            <Box className="rnx-syntax-highlighter-btn-wrapper">
              <Button
                size="icon"
                variant="ghost"
                onClick={copyToClipboard}
                aria-label={isCopied ? "Code copied" : "Copy code"}
                title="Copy code"
              >
                {isCopied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </Box>
          </Flex>
        )}

        <Box className="relative">
          {!withHeader && (
            <Button
              size="icon"
              variant="ghost"
              className="rnx-syntax-highlighter-copy-btn"
              onClick={copyToClipboard}
              aria-label={isCopied ? "Code copied" : "Copy code"}
              title="Copy code"
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}

          <Highlight
            theme={isDark ? themes.vsDark : themes.vsLight}
            code={code.trim()}
            language={language}
          >
            {({
              className: highlightClass,
              style,
              tokens,
              getLineProps,
              getTokenProps,
            }) => (
              <pre
                className={cn(highlightClass, "rnx-syntax-highlighter-pre")}
                style={style}
              >
                {tokens.map((line, i) => {
                  const { key: lineKey, ...lineProps } = getLineProps({
                    line,
                    key: i,
                  });
                  return (
                    <Box
                      key={(lineKey as React.Key) || i}
                      {...lineProps}
                      className="table-row"
                    >
                      {showLineNumbers && (
                        <Box
                          as="span"
                          className="rnx-syntax-highlighter__line-number table-cell select-none"
                        >
                          {i + 1}
                        </Box>
                      )}
                      <Box as="span" className="table-cell">
                        {line.map((token, key) => {
                          const { key: tokenKey, ...tokenProps } =
                            getTokenProps({
                              token,
                              key,
                            });
                          return (
                            <Box
                              as="span"
                              key={(tokenKey as React.Key) || key}
                              {...tokenProps}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })}
              </pre>
            )}
          </Highlight>
        </Box>
      </Box>
    );
  },
);
SyntaxHighlighter.displayName = "SyntaxHighlighter";
