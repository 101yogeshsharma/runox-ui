import { API, FileInfo, Options } from "jscodeshift";

/**
 * Codemod: migrate flat component imports/usages to dot-notation namespaces.
 *
 * `@runox/ui` v0.3+ exports composed components as namespace objects
 * (e.g. `Modal` with members `Modal.Header`, `Modal.Footer`) instead of flat
 * named exports (`ModalHeader`, `ModalFooter`).
 *
 * This transform:
 * 1. Rewrites import specifiers: `import { ModalHeader } from "@runox/ui"`
 *    → the `Modal` specifier is kept/added, `ModalHeader` dropped.
 * 2. Rewrites JSX usages: `<ModalHeader>` → `<Modal.Header>`.
 * 3. Rewrites identifier references in non-JSX positions where unambiguous.
 *
 * Usage: runox migrate --from flat
 */

// Flat name → [namespaceRoot, member]
const FLAT_TO_DOT: Record<string, [string, string]> = {
  // Modal
  ModalHeader: ["Modal", "Header"],
  ModalTitle: ["Modal", "Title"],
  ModalDescription: ["Modal", "Description"],
  ModalBody: ["Modal", "Body"],
  ModalFooter: ["Modal", "Footer"],
  ModalCloseButton: ["Modal", "CloseButton"],
  ModalContent: ["Modal", "Content"],
  ModalTrigger: ["Modal", "Trigger"],
  // AlertDialog
  AlertDialogAction: ["AlertDialog", "Action"],
  AlertDialogCancel: ["AlertDialog", "Cancel"],
  AlertDialogContent: ["AlertDialog", "Content"],
  AlertDialogDescription: ["AlertDialog", "Description"],
  AlertDialogFooter: ["AlertDialog", "Footer"],
  AlertDialogHeader: ["AlertDialog", "Header"],
  AlertDialogOverlay: ["AlertDialog", "Overlay"],
  AlertDialogPortal: ["AlertDialog", "Portal"],
  AlertDialogTitle: ["AlertDialog", "Title"],
  AlertDialogTrigger: ["AlertDialog", "Trigger"],
  // Dropdown
  DropdownTrigger: ["Dropdown", "Trigger"],
  DropdownContent: ["Dropdown", "Content"],
  DropdownItem: ["Dropdown", "Item"],
  DropdownLabel: ["Dropdown", "Label"],
  DropdownSeparator: ["Dropdown", "Separator"],
  // Select
  SelectTrigger: ["Select", "Trigger"],
  SelectValue: ["Select", "Value"],
  SelectContent: ["Select", "Content"],
  SelectItem: ["Select", "Item"],
  // Card
  CardHeader: ["Card", "Header"],
  CardTitle: ["Card", "Title"],
  CardDescription: ["Card", "Description"],
  CardContent: ["Card", "Content"],
  CardBody: ["Card", "Body"],
  CardFooter: ["Card", "Footer"],
  // Accordion
  AccordionItem: ["Accordion", "Item"],
  AccordionTrigger: ["Accordion", "Trigger"],
  AccordionContent: ["Accordion", "Content"],
  // Tabs
  TabsList: ["Tabs", "List"],
  TabsTrigger: ["Tabs", "Trigger"],
  TabsContent: ["Tabs", "Content"],
};

export default function transformer(
  file: FileInfo,
  api: API,
  _options: Options,
) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasModifications = false;
  const neededRoots = new Set<string>();

  const recordRoot = (flatName: string) => {
    const mapping = FLAT_TO_DOT[flatName];
    if (mapping) neededRoots.add(mapping[0]);
  };

  // 1. Imports: drop flat specifiers, ensure namespace roots are imported.
  root.find(j.ImportDeclaration).forEach((p) => {
    if (p.node.source.value !== "@runox/ui") return;
    const existing = new Set(
      (p.node.specifiers ?? [])
        .filter((s) => j.ImportSpecifier.check(s))
        .map((s) => (j.Identifier.check(s.imported) ? s.imported.name : "")),
    );
    p.node.specifiers = (p.node.specifiers ?? []).filter((spec) => {
      if (!j.ImportSpecifier.check(spec)) return true;
      const imported = j.Identifier.check(spec.imported)
        ? spec.imported.name
        : null;
      if (imported && FLAT_TO_DOT[imported]) {
        recordRoot(imported);
        hasModifications = true;
        return false;
      }
      return true;
    });
    for (const rootName of neededRoots) {
      if (!existing.has(rootName)) {
        p.node.specifiers.push(j.importSpecifier(j.identifier(rootName)));
      }
    }
  });

  // 2. JSX elements: <ModalHeader> → <Modal.Header>
  root.find(j.JSXElement).forEach((path) => {
    const name = path.node.openingElement.name;
    if (!j.JSXIdentifier.check(name)) return;
    const mapping = FLAT_TO_DOT[name.name];
    if (!mapping) return;

    const member = j.jsxMemberExpression(
      j.jsxIdentifier(mapping[0]),
      j.jsxIdentifier(mapping[1]),
    );
    path.node.openingElement.name = member;
    if (path.node.closingElement && path.node.closingElement.name) {
      path.node.closingElement.name = member;
    }
    recordRoot(name.name);
    hasModifications = true;
  });

  // 3. Non-JSX identifier references (render fns, variables holding elements).
  root.find(j.JSXIdentifier).forEach(() => {
    /* handled above */
  });
  root.find(j.Identifier).forEach((path) => {
    const name = path.node.name;
    if (!FLAT_TO_DOT[name]) return;
    // Only rewrite references, not declarations or property keys.
    const parent = path.parentPath?.node;
    if (!parent) return;
    if (
      parent.type === "ImportSpecifier" ||
      parent.type === "ImportDefaultSpecifier" ||
      (parent.type === "FunctionDeclaration" && parent.id === path.node) ||
      (parent.type === "VariableDeclarator" && parent.id === path.node) ||
      (parent.type === "Property" &&
        parent.key === path.node &&
        !parent.computed)
    ) {
      return;
    }
    const mapping = FLAT_TO_DOT[name];
    path.replace(
      j.memberExpression(j.identifier(mapping[0]), j.identifier(mapping[1])),
    );
    recordRoot(name);
    hasModifications = true;
  });

  return hasModifications ? root.toSource() : null;
}
