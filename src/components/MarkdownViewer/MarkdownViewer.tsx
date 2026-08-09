"use client";
import "./MarkdownViewer.css";
import { Box } from "../../atoms/Box";
import { Text } from "../../atoms/Text";

import React from "react";
import { Highlight, themes, Language } from "prism-react-renderer";
import { cn } from "../../utils/cn";

export interface MarkdownViewerProps {
  children: string;
  className?: string;
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Patterns: bold, italic, inline code, link
  const regex =
    /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <strong key={match.index} className="font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <em key={match.index} className="italic">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      parts.push(
        <code
          key={match.index}
          className="bg-muted text-foreground rnx-markdown-viewer__inline-code rounded px-1.5 py-0.5 font-mono"
        >
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      let href = match[9];
      if (href.trim().toLowerCase().startsWith("javascript:")) {
        href = "#";
      }
      parts.push(
        <a
          key={match.index}
          href={href}
          className="text-primary underline underline-offset-4 hover:opacity-80"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[8]}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function renderMarkdown(markdown: string): React.ReactNode[] {
  const lines = markdown.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || "text";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const code = codeLines.join("\n");
      nodes.push(
        <Box
          key={i}
          className="border-border/20 rnx-markdown-viewer__code-block my-4 overflow-hidden rounded-xl border"
        >
          <Highlight
            theme={themes.vsDark}
            code={code.trim()}
            language={lang as Language}
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={cn(
                  className,
                  "m-0 overflow-x-auto bg-transparent! p-4 font-mono text-sm leading-relaxed"
                )}
                style={style}
              >
                {tokens.map((lineTokens, li) => {
                  const { key: lineKey, ...lineProps } = getLineProps({
                    line: lineTokens,
                    key: li,
                  });
                  return (
                    <Box
                      key={(lineKey as string | number) ?? li}
                      {...lineProps}
                    >
                      {lineTokens.map((token, ti) => {
                        const { key: tokenKey, ...tokenProps } = getTokenProps({
                          token,
                          key: ti,
                        });
                        return (
                          <Box
                            as="span"
                            key={(tokenKey as string | number) ?? ti}
                            {...tokenProps}
                          />
                        );
                      })}
                    </Box>
                  );
                })}
              </pre>
            )}
          </Highlight>
        </Box>
      );
      continue;
    }

    // Headings — accept optional space after # (e.g. both "# Heading" and "#Heading")
    const h6 = line.match(/^######\s?(.*)/);
    const h5 = line.match(/^#####\s?(.*)/);
    const h4 = line.match(/^####\s?(.*)/);
    const h3 = line.match(/^###\s?(.*)/);
    const h2 = line.match(/^##\s?(.*)/);
    const h1 = line.match(/^#\s?(.+)/);

    if (h1) {
      nodes.push(
        <Text
          as="h1"
          key={i}
          className="text-foreground mt-6 mb-3 text-3xl font-bold tracking-tight"
        >
          {parseInline(h1[1])}
        </Text>
      );
      i++;
      continue;
    }
    if (h2) {
      nodes.push(
        <Text
          as="h2"
          key={i}
          className="text-foreground mt-5 mb-2 text-2xl font-semibold tracking-tight"
        >
          {parseInline(h2[1])}
        </Text>
      );
      i++;
      continue;
    }
    if (h3) {
      nodes.push(
        <Text
          as="h3"
          key={i}
          className="text-foreground mt-4 mb-2 text-xl font-semibold"
        >
          {parseInline(h3[1])}
        </Text>
      );
      i++;
      continue;
    }
    if (h4) {
      nodes.push(
        <Text
          as="h4"
          key={i}
          className="text-foreground mt-3 mb-1 text-lg font-semibold"
        >
          {parseInline(h4[1])}
        </Text>
      );
      i++;
      continue;
    }
    if (h5) {
      nodes.push(
        <h5
          key={i}
          className="text-foreground mt-2 mb-1 text-base font-semibold"
        >
          {parseInline(h5[1])}
        </h5>
      );
      i++;
      continue;
    }
    if (h6) {
      nodes.push(
        <h6 key={i} className="text-foreground mt-2 mb-1 text-sm font-semibold">
          {parseInline(h6[1])}
        </h6>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} className="border-border my-4" />);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const content = line.slice(2);
      nodes.push(
        <blockquote
          key={i}
          className="border-primary/40 text-foreground/70 my-3 border-l-4 pl-4 italic"
        >
          {parseInline(content)}
        </blockquote>
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <Box
          as="ul"
          key={i}
          className="text-foreground my-3 list-disc space-y-1 pl-6"
        >
          {items.map((item, idx) => (
            <Box as="li" key={idx} className="leading-relaxed">
              {parseInline(item)}
            </Box>
          ))}
        </Box>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      nodes.push(
        <ol
          key={i}
          className="text-foreground my-3 list-decimal space-y-1 pl-6"
        >
          {items.map((item, idx) => (
            <Box as="li" key={idx} className="leading-relaxed">
              {parseInline(item)}
            </Box>
          ))}
        </ol>
      );
      continue;
    }

    // Table
    if (line.includes("|") && lines[i + 1]?.match(/^\|?[\s:-]+\|/)) {
      const headerCells = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(
          lines[i]
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean)
        );
        i++;
      }
      nodes.push(
        <Box
          key={i}
          className="border-border my-4 overflow-x-auto rounded-lg border"
        >
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {headerCells.map((cell, ci) => (
                  <th
                    key={ci}
                    className="text-foreground border-border border-b px-4 py-2 text-left font-semibold"
                  >
                    {parseInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-border hover:bg-muted/30 border-b transition-colors last:border-0"
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="text-foreground/80 px-4 py-2">
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6}\s?/.test(lines[i]) &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("> ") &&
      !(lines[i].includes("|") && lines[i + 1]?.match(/^\|?[\s:-]+\|/)) &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      nodes.push(
        <Text key={i} className="text-foreground/80 my-2 leading-relaxed">
          {parseInline(paraLines.join(" "))}
        </Text>
      );
    } else {
      i++;
    }
  }

  return nodes;
}

export function MarkdownViewer({ children, className }: MarkdownViewerProps) {
  return (
    <Box className={cn("rnx-markdown-viewer prose-sm max-w-none", className)}>
      {renderMarkdown(children)}
    </Box>
  );
}

MarkdownViewer.displayName = "MarkdownViewer";
