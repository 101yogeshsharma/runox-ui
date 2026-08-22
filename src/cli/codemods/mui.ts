import { API, FileInfo, Options } from "jscodeshift";
import mappingData from "./mapping.json";

export default function transformer(file: FileInfo, api: API, _options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const mapping = mappingData.mui as any;
  let hasModifications = false;

  // 1. Rename imports
  root.find(j.ImportDeclaration).forEach((path) => {
    if (path.node.source.value === "@mui/material") {
      path.node.source.value = mapping.imports["@mui/material"];
      
      // Update imported specifiers
      if (path.node.specifiers) {
        path.node.specifiers.forEach((specifier) => {
          if (j.ImportSpecifier.check(specifier) && j.Identifier.check(specifier.imported)) {
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
    if (j.JSXIdentifier.check(openingElement.name)) {
      const originalName = openingElement.name.name;
      
      // Check if we mapped this component import (we just renamed the JSX tag blindly for simplicity if it matched)
      // Note: A safer way is checking if it's imported from the target lib, but for a codemod this is often acceptable.
      let newName = originalName;
      // Because we renamed imports above, the JSX tag should be the NEW name! Wait!
      // If we rename imports, we must rename JSX tags from the OLD name to the NEW name.
      // But wait, if we rename the JSX tag, we should look for the OLD name here.
      // But we ALREADY renamed the local variable in the import specifier above? 
      // If we rename the local variable in the import, jscodeshift does NOT automatically rename all references in the file!
      // We must rename references manually.
      
      // Let's just rename the JSX tags from old to new.
      if (mapping.components[originalName]) {
        newName = mapping.components[originalName];
        openingElement.name.name = newName;
        if (path.node.closingElement && j.JSXIdentifier.check(path.node.closingElement.name)) {
          path.node.closingElement.name.name = newName;
        }
        hasModifications = true;
      }
      
      // The prop mapping uses the OLD originalName for lookup (e.g. "Button" or "Typography")
      const propsMapping = mapping.props[originalName];
      if (propsMapping && openingElement.attributes) {
        openingElement.attributes.forEach((attr) => {
          if (j.JSXAttribute.check(attr) && j.JSXIdentifier.check(attr.name)) {
            const propName = attr.name.name;
            const propValMapping = propsMapping[propName];
            
            if (propValMapping) {
              if (typeof propValMapping === 'string') {
                // Direct prop rename
                attr.name.name = propValMapping;
                hasModifications = true;
              } else if (typeof propValMapping === 'object') {
                // Enum mapping
                if (attr.value && j.Literal.check(attr.value)) {
                  const oldVal = String(attr.value.value);
                  if (propValMapping[oldVal]) {
                    attr.value.value = propValMapping[oldVal];
                    hasModifications = true;
                  }
                }
              }
            } else if (propName === "sx") {
               // Flag sx as unsupported
               // Add a comment to the node
               if (!attr.comments) attr.comments = [];
               attr.comments.push(j.commentBlock(" TODO: manually convert sx prop ", false, false));
               hasModifications = true;
            }
          }
        });
      }
    }
  });

  return hasModifications ? root.toSource() : null;
}
