import { API, FileInfo, Options } from "jscodeshift";
import mappingData from "./mapping.json";

function transformMuiAttribute(
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

  // 1. Rename imports
  root.find(j.ImportDeclaration).forEach((path) => {
    if (path.node.source.value === "@mui/material") {
      path.node.source.value = mapping.imports["@mui/material"];

      if (path.node.specifiers) {
        path.node.specifiers.forEach((specifier) => {
          if (
            j.ImportSpecifier.check(specifier) &&
            j.Identifier.check(specifier.imported)
          ) {
            const importedName = specifier.imported.name;
            if (mapping.components[importedName]) {
              specifier.imported.name = mapping.components[importedName];
              if (specifier.local && specifier.local.name === importedName) {
                specifier.local.name = mapping.components[importedName];
              }
            }
          }
        });
      }
      hasModifications = true;
    }
  });

  // 2. Rename components in JSX
  root.find(j.JSXElement).forEach((path) => {
    const openingElement = path.node.openingElement;
    if (!j.JSXIdentifier.check(openingElement.name)) return;

    const originalName = openingElement.name.name;
    if (mapping.components[originalName]) {
      const newName = mapping.components[originalName];
      openingElement.name.name = newName;
      if (
        path.node.closingElement &&
        j.JSXIdentifier.check(path.node.closingElement.name)
      ) {
        path.node.closingElement.name.name = newName;
      }
      hasModifications = true;
    }

    const propsMapping = mapping.props[originalName];
    if (propsMapping && openingElement.attributes) {
      openingElement.attributes.forEach((attr) => {
        if (transformMuiAttribute(j, attr, propsMapping)) {
          hasModifications = true;
        }
      });
    }
  });

  return hasModifications ? root.toSource() : null;
}
