"use client";
import "./MarkdownViewer.css";
import { Box } from "../../atoms/Box";
import { Text } from "../../atoms/Text";

import React from "react";
import { Highlight, themes, Language } from "prism-react-renderer";
import { cn } from "../../utils/cn";
import { rnx } from "../../utils/rnx";

/**
 * Props for the MarkdownViewer component.
 */
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
        <strong key={match.index} className="rnx-markdown-viewer__strong">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      parts.push(
        <em key={match.index} className="rnx-markdown-viewer__em">
          {match[4]}
        </em>,
      );
    } else if (match[5]) {
      parts.push(
        <code key={match.index} className="rnx-markdown-viewer__inline-code">
          {match[6]}
        </code>,
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
          className="rnx-markdown-viewer__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[8]}
        </a>,
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
        <Box key={i} className="rnx-markdown-viewer__code-block">
          <Highlight
            theme={themes.vsDark}
            code={code.trim()}
            language={lang as Language}
          >
            {({
              className,
              style,
              tokens,
              getLineProps,
              getTokenProps,
            }: any) => (
              <pre
                className={cn(className, "rnx-markdown-viewer__pre")}
                style={style}
              >
                {tokens.map((lineTokens: any, li: number) => {
                  const { key: lineKey, ...lineProps } = getLineProps({
                    line: lineTokens,
                    key: li,
                  });
                  return (
                    <Box
                      key={(lineKey as string | number) ?? li}
                      {...lineProps}
                    >
                      {lineTokens.map((token: any, ti: number) => {
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
        </Box>,
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
        <Text as="h1" key={i} className="rnx-markdown-viewer__h1">
          {parseInline(h1[1])}
        </Text>,
      );
      i++;
      continue;
    }
    if (h2) {
      nodes.push(
        <Text as="h2" key={i} className="rnx-markdown-viewer__h2">
          {parseInline(h2[1])}
        </Text>,
      );
      i++;
      continue;
    }
    if (h3) {
      nodes.push(
        <Text as="h3" key={i} className="rnx-markdown-viewer__h3">
          {parseInline(h3[1])}
        </Text>,
      );
      i++;
      continue;
    }
    if (h4) {
      nodes.push(
        <Text as="h4" key={i} className="rnx-markdown-viewer__h4">
          {parseInline(h4[1])}
        </Text>,
      );
      i++;
      continue;
    }
    if (h5) {
      nodes.push(
        <h5 key={i} className="rnx-markdown-viewer__h5">
          {parseInline(h5[1])}
        </h5>,
      );
      i++;
      continue;
    }
    if (h6) {
      nodes.push(
        <h6 key={i} className="rnx-markdown-viewer__h6">
          {parseInline(h6[1])}
        </h6>,
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} className="rnx-markdown-viewer__hr" />);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const content = line.slice(2);
      nodes.push(
        <blockquote key={i} className="rnx-markdown-viewer__blockquote">
          {parseInline(content)}
        </blockquote>,
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
        <Box as="ul" key={i} className="rnx-markdown-viewer__ul">
          {items.map((item, idx) => (
            <Box as="li" key={idx} className="leading-relaxed">
              {parseInline(item)}
            </Box>
          ))}
        </Box>,
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
        <ol key={i} className="rnx-markdown-viewer__ol">
          {items.map((item, idx) => (
            <Box as="li" key={idx} className="leading-relaxed">
              {parseInline(item)}
            </Box>
          ))}
        </ol>,
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
            .filter(Boolean),
        );
        i++;
      }
      nodes.push(
        <Box key={i} className="rnx-markdown-viewer__table-container">
          <table className="rnx-markdown-viewer__table">
            <thead>
              <tr>
                {headerCells.map((cell, ci) => (
                  <th key={ci}>{parseInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{parseInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>,
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
        <Text key={i} className="rnx-markdown-viewer__paragraph">
          {parseInline(paraLines.join(" "))}
        </Text>,
      );
    } else {
      i++;
    }
  }

  return nodes;
}

export function MarkdownViewer({ children, className }: MarkdownViewerProps) {
  return (
    <Box
      {...rnx({ component: "MarkdownViewer" })}
      className={cn("rnx-markdown-viewer", className)}
    >
      {renderMarkdown(children)}
    </Box>
  );
}

MarkdownViewer.displayName = "MarkdownViewer";
