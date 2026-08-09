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
// Uses: Button

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
    ref
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

    return (
      <Box
        className={cn(
          "text-foreground border-border/20 w-full overflow-hidden rounded-xl border bg-[var(--code-block-bg)]",
          className
        )}
        ref={ref}
        {...props}
      >
        {withHeader && (
          <Flex
            align="center"
            gap="sm"
            className="bg-card/40 border-border/20 border-b px-4 py-2"
          >
            <Box className="flex w-1/3 items-center space-x-2">
              <Box className="bg-destructive h-3 w-3 rounded-full" />
              <Box className="bg-warning h-3 w-3 rounded-full" />
              <Box className="bg-success h-3 w-3 rounded-full" />
            </Box>
            <Box className="flex w-1/3 justify-center">
              <Text className="text-muted-foreground font-mono text-xs">
                {language}
              </Text>
            </Box>
            <Box className="flex w-1/3 justify-end">
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:bg-muted/10 hover:text-foreground h-7 w-7"
                onClick={copyToClipboard}
                title="Copy code"
              >
                {isCopied ? (
                  <Check className="text-success h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </Box>
          </Flex>
        )}

        <Box className="relative">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "text-muted-foreground hover:bg-muted/10 hover:text-foreground absolute top-2 right-2 h-8 w-8",
              withHeader && "hidden" // If header exists, we usually put a different copy mechanism or skip it, but let's keep it in the top right of the code block.
            )}
            onClick={copyToClipboard}
            title="Copy code"
          >
            {isCopied ? (
              <Check className="text-success h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>

          <Highlight
            theme={themes.vsDark}
            code={code.trim()}
            language={language}
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={cn(
                  className,
                  "m-0 overflow-x-auto bg-transparent! p-4 font-mono text-sm leading-relaxed"
                )}
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
                          className="rnx-syntax-highlighter__line-number table-cell pr-4 text-right opacity-50 select-none"
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
  }
);
SyntaxHighlighter.displayName = "SyntaxHighlighter";
