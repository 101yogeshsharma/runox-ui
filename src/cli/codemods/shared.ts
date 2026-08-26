import type { Collection } from "jscodeshift";

/**
 * Shared utilities for the framework-migration codemods.
 *
 * Handles:
 * - Dot-notation component names (`Card.Header`) in JSX open/close tags
 * - Merging multiple named imports into a single namespace-style usage
 * - Collecting and reporting ALL unmapped components/props at end of run
 */

export interface UnmappedReport {
  file: string;
  component: string;
  prop?: string;
}

const collectedReports: UnmappedReport[] = [];

export function reportUnmapped(
  file: string,
  component: string,
  prop?: string,
): void {
  collectedReports.push({ file, component, prop });
}

export function flushUnmappedReport(): void {
  if (collectedReports.length === 0) {
    console.log("\n✓ No unmapped components or props.");
    return;
  }
  console.log(
    `\n⚠ ${collectedReports.length} unmapped item(s) require manual review:\n`,
  );
  const byFile = new Map<string, UnmappedReport[]>();
  for (const r of collectedReports) {
    const list = byFile.get(r.file) ?? [];
    list.push(r);
    byFile.set(r.file, list);
  }
  for (const [file, items] of byFile) {
    console.log(`  ${file}`);
    for (const item of items) {
      console.log(
        `    - <${item.component}>${item.prop ? ` prop "${item.prop}"` : ""}`,
      );
    }
  }
  collectedReports.length = 0;
}

/**
 * Sets a JSX element's tag name, supporting dot notation.
 * `<CardHeader />` → `<Card.Header />` (open + close).
 */
export function setJsxName(j: any, path: any, newName: string): void {
  const openingElement = path.node.openingElement;
  if (newName.includes(".")) {
    const [object, property] = newName.split(".");
    openingElement.name = j.jsxMemberExpression(
      j.jsxIdentifier(object),
      j.jsxIdentifier(property),
    );
    if (path.node.closingElement && path.node.closingElement.name) {
      path.node.closingElement.name = j.jsxMemberExpression(
        j.jsxIdentifier(object),
        j.jsxIdentifier(property),
      );
    }
  } else {
    openingElement.name = j.jsxIdentifier(newName);
    if (path.node.closingElement && path.node.closingElement.name) {
      path.node.closingElement.name = j.jsxIdentifier(newName);
    }
  }
}

/** Returns the display name of a JSX element (supports member expressions). */
export function getJsxName(element: any): string | null {
  const name = element?.name;
  if (!name) return null;
  if (name.type === "JSXIdentifier") return name.name;
  if (
    name.type === "JSXMemberExpression" &&
    name.object?.type === "JSXIdentifier" &&
    name.property?.type === "JSXIdentifier"
  ) {
    return `${name.object.name}.${name.property.name}`;
  }
  return null;
}

/**
 * Rewrites import specifiers so each mapped component is imported as its
 * namespace root. E.g. after mapping CardHeader → Card.Header, the import
 * of `CardHeader` becomes an import of `Card`.
 */
export function rewriteImportSpecifiers(
  j: any,
  root: Collection<any>,
  sourceValue: string,
  mappingComponents: Record<string, string>,
): boolean {
  let modified = false;
  root.find(j.ImportDeclaration).forEach((p: any) => {
    if (p.node.source.value !== sourceValue) return;
    p.node.source.value = "@runox/ui";
    const seenRoots = new Set<string>();
    p.node.specifiers = (p.node.specifiers ?? []).filter((spec: any) => {
      if (!j.ImportSpecifier.check(spec)) return true;
      const imported = spec.imported?.name;
      if (!imported || !mappingComponents[imported]) return true;
      const target = mappingComponents[imported];
      const rootName = target.split(".")[0];
      seenRoots.add(rootName);
      modified = true;
      return false; // drop old specifier; roots added below
    });
    // Add one specifier per unique namespace root not already imported
    const existing = new Set(
      (p.node.specifiers ?? [])
        .filter((s: any) => j.ImportSpecifier.check(s))
        .map((s: any) => s.imported?.name)
        .filter(Boolean),
    );
    for (const rootName of seenRoots) {
      if (!existing.has(rootName)) {
        p.node.specifiers.push(j.importSpecifier(j.identifier(rootName)));
      }
    }
  });
  return modified;
}
