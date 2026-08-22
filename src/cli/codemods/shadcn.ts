import { API, FileInfo, Options } from "jscodeshift";
import mappingData from "./mapping.json";

export default function transformer(file: FileInfo, api: API, _options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const mapping = mappingData.shadcn as any;
  let hasModifications = false;

  // 1. Rename imports
  // Shadcn UI uses specific component paths like "@/components/ui/button"
  root.find(j.ImportDeclaration).forEach((path) => {
    if (j.Literal.check(path.node.source) && typeof path.node.source.value === "string") {
      const sourceStr = path.node.source.value;
      if (mapping.imports[sourceStr]) {
        path.node.source.value = mapping.imports[sourceStr];
        hasModifications = true;
      }
    }

    if (path.node.specifiers) {
      path.node.specifiers.forEach((specifier) => {
        if (j.ImportSpecifier.check(specifier) && j.Identifier.check(specifier.imported)) {
          const importedName = specifier.imported.name;
          if (mapping.components[importedName]) {
            specifier.imported.name = mapping.components[importedName];
            if (specifier.local && specifier.local.name === importedName) {
              specifier.local.name = mapping.components[importedName];
            }
            hasModifications = true;
          }
        }
      });
    }
  });

  // 2. Rename components in JSX
  root.find(j.JSXElement).forEach((path) => {
    const openingElement = path.node.openingElement;
    if (j.JSXIdentifier.check(openingElement.name)) {
      const originalName = openingElement.name.name;
      
      let newName = originalName;
      if (mapping.components[originalName]) {
        newName = mapping.components[originalName];
        openingElement.name.name = newName;
        if (path.node.closingElement && j.JSXIdentifier.check(path.node.closingElement.name)) {
          path.node.closingElement.name.name = newName;
        }
        hasModifications = true;
      }
      
      const propsMapping = mapping.props[originalName];
      if (propsMapping && openingElement.attributes) {
        openingElement.attributes.forEach((attr) => {
          if (j.JSXAttribute.check(attr) && j.JSXIdentifier.check(attr.name)) {
            const propName = attr.name.name;
            const propValMapping = propsMapping[propName];
            
            if (propValMapping) {
              if (typeof propValMapping === 'string') {
                attr.name.name = propValMapping;
                hasModifications = true;
              } else if (typeof propValMapping === 'object') {
                if (attr.value && j.Literal.check(attr.value)) {
                  const oldVal = String(attr.value.value);
                  if (propValMapping[oldVal]) {
                    attr.value.value = propValMapping[oldVal];
                    hasModifications = true;
                  }
                }
              }
            }
          }
        });
      }
    }
  });

  return hasModifications ? root.toSource() : null;
}
