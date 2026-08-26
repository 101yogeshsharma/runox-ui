import { describe, it, expect, vi, beforeEach } from "vitest";
import jscodeshift from "jscodeshift";
import {
  reportUnmapped,
  flushUnmappedReport,
  setJsxName,
  getJsxName,
  rewriteImportSpecifiers,
} from "../shared";

const j = jscodeshift;

describe("codemod shared utilities", () => {
  describe("unmapped reporting", () => {
    beforeEach(() => {
      vi.spyOn(console, "log").mockImplementation(() => {});
    });

    it("flushUnmappedReport prints a clean summary when nothing collected", () => {
      flushUnmappedReport();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("No unmapped"),
      );
    });

    it("flushUnmappedReport groups reports by file and clears the buffer", () => {
      reportUnmapped("a.tsx", "Card", "size");
      reportUnmapped("a.tsx", "Button");
      reportUnmapped("b.tsx", "Stack", "spacing");

      flushUnmappedReport();

      const calls = (console.log as any).mock.calls.map((c: any[]) =>
        c.join(" "),
      );
      const joined = calls.join("\n");
      expect(joined).toContain("3 unmapped item(s)");
      expect(joined).toContain("a.tsx");
      expect(joined).toContain('<Card> prop "size"');
      expect(joined).toContain("<Button>");
      expect(joined).toContain("b.tsx");

      // Buffer cleared — second flush is clean
      flushUnmappedReport();
      expect(console.log).toHaveBeenLastCalledWith(
        expect.stringContaining("No unmapped"),
      );
    });
  });

  describe("getJsxName", () => {
    it("reads a plain JSX identifier", () => {
      const ast = j("<Card />");
      let name: string | null = null;
      ast.find(j.JSXElement).forEach((p: any) => {
        name = getJsxName(p.node.openingElement);
      });
      expect(name).toBe("Card");
    });

    it("reads a member-expression JSX name", () => {
      const ast = j("<Card.Header />");
      let name: string | null = null;
      ast.find(j.JSXElement).forEach((p: any) => {
        name = getJsxName(p.node.openingElement);
      });
      expect(name).toBe("Card.Header");
    });

    it("returns null for missing/unknown shapes", () => {
      expect(getJsxName(null)).toBeNull();
      expect(getJsxName({})).toBeNull();
      expect(getJsxName({ name: { type: "JSXNamespacedName" } })).toBeNull();
    });
  });

  describe("setJsxName", () => {
    it("rewrites both opening and closing tags to a member expression", () => {
      const ast = j("<CardHeader><CardHeader /></CardHeader>");
      ast
        .find(j.JSXElement)
        .forEach((p: any) => setJsxName(j, p, "Card.Header"));
      const out = ast.toSource().replace(/\s+/g, "");
      expect(out).toContain("<Card.Header>");
      expect(out).toContain("</Card.Header>");
      expect(out).not.toContain("CardHeader");
    });

    it("rewrites tags to a plain identifier when no dot is present", () => {
      const ast = j("<OldButton>hi</OldButton>");
      ast.find(j.JSXElement).forEach((p: any) => setJsxName(j, p, "Button"));
      const out = ast.toSource();
      expect(out).toContain("<Button>hi</Button>");
    });

    it("handles self-closing elements without closing tags", () => {
      const ast = j("<CardHeader />");
      ast
        .find(j.JSXElement)
        .forEach((p: any) => setJsxName(j, p, "Card.Header"));
      const out = ast.toSource().replace(/\s+/g, "");
      expect(out).toBe("<Card.Header/>");
    });
  });

  describe("rewriteImportSpecifiers", () => {
    it("drops mapped specifiers and adds their namespace roots once", () => {
      const src = `import { CardHeader, CardTitle, Button } from "@/components/ui/card";`;
      const root = j(src);
      const modified = rewriteImportSpecifiers(
        j,
        root,
        "@/components/ui/card",
        { CardHeader: "Card.Header", CardTitle: "Card.Title" },
      );
      expect(modified).toBe(true);
      const out = root.toSource();
      expect(out).toContain("Card");
      expect(out).not.toContain("CardHeader");
      expect(out).not.toContain("CardTitle");
      // Button isn't mapped so it stays
      expect(out).toContain("Button");
      // Only one Card specifier even though two members mapped to it
      expect(out.match(/\bCard\b/g)?.length).toBe(1);
    });

    it("returns false and keeps source untouched when source module doesn't match", () => {
      const src = `import { CardHeader } from "elsewhere";`;
      const root = j(src);
      const modified = rewriteImportSpecifiers(
        j,
        root,
        "@/components/ui/card",
        {
          CardHeader: "Card.Header",
        },
      );
      expect(modified).toBe(false);
      expect(root.toSource()).toContain("CardHeader");
    });

    it("does not duplicate a namespace root that is already imported", () => {
      const src = `import { Card, CardContent } from "@/components/ui/card";`;
      const root = j(src);
      rewriteImportSpecifiers(j, root, "@/components/ui/card", {
        CardContent: "Card.Body",
      });
      const out = root.toSource();
      const cardSpecifiers = out.match(/\bCard\b/g)?.length ?? 0;
      expect(cardSpecifiers).toBe(1);
      expect(out).not.toContain("CardContent");
    });
  });
});
