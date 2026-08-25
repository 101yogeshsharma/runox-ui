import { API, FileInfo, Options } from "jscodeshift";
import mappingData from "./mapping.json";
import {
  setJsxName,
  getJsxName,
  rewriteImportSpecifiers,
  reportUnmapped,
} from "./shared";

function transformAttribute(
  j: any,
  attr: any,
  propsMapping: Record<string, any>,
): boolean {
  if (!j.JSXAttribute.check(attr) || !j.JSXIdentifier.check(attr.name)) {
    return false;
  }
  const propName = attr.name.name;
  const propValMapping = propsMapping[propName];

  if (propValMapping) {
    if (typeof propValMapping === "string") {
      attr.name.name = propValMapping;
      return true;
    }
    if (
      typeof propValMapping === "object" &&
      attr.value &&
      j.Literal.check(attr.value)
    ) {
      const oldVal = String(attr.value.value);
      if (propValMapping[oldVal]) {
        attr.value.value = propValMapping[oldVal];
        return true;
      }
    }
  } else if (propName === "sx") {
    if (!attr.comments) attr.comments = [];
    attr.comments.push(
      j.commentBlock(" TODO: manually convert sx prop ", false, false),
    );
    return true;
  }

  return false;
}

export default function transformer(
  file: FileInfo,
  api: API,
  _options: Options,
) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const mapping = mappingData.mui as any;
  let hasModifications = false;

  // 1. Rewrite imports to namespace roots
  hasModifications =
    rewriteImportSpecifiers(j, root, "@mui/material", mapping.components) ||
    hasModifications;

  // 2. Rename components in JSX (supports dot-notation targets)
  root.find(j.JSXElement).forEach((path: any) => {
    const openingElement = path.node.openingElement;
    const originalName = getJsxName(openingElement);
    if (!originalName || originalName.includes(".")) return;

    if (mapping.components[originalName]) {
      setJsxName(j, path, mapping.components[originalName]);
      hasModifications = true;
    }

    const propsMapping = mapping.props[originalName];
    if (openingElement.attributes) {
      openingElement.attributes.forEach((attr: any) => {
        if (propsMapping && transformAttribute(j, attr, propsMapping)) {
          hasModifications = true;
          return;
        }
        // Loud reporting for ALL unmapped non-DOM props
        if (
          j.JSXAttribute.check(attr) &&
          j.JSXIdentifier.check(attr.name) &&
          !isLikelyDomProp(attr.name.name)
        ) {
          reportUnmapped(file.path, originalName, attr.name.name);
        }
      });
    }
  });

  return hasModifications ? root.toSource() : null;
}

const DOM_PROPS = new Set([
  "className",
  "id",
  "style",
  "children",
  "key",
  "ref",
  "onClick",
  "onChange",
  "onSubmit",
  "onFocus",
  "onBlur",
  "onKeyDown",
  "onKeyUp",
  "onMouseEnter",
  "onMouseLeave",
  "type",
  "value",
  "defaultValue",
  "placeholder",
  "disabled",
  "required",
  "name",
  "href",
  "src",
  "alt",
  "title",
  "role",
  "tabIndex",
  "aria-label",
  "aria-hidden",
  "data-testid",
]);

function isLikelyDomProp(name: string): boolean {
  return (
    DOM_PROPS.has(name) || name.startsWith("aria-") || name.startsWith("data-")
  );
}
