const fs = require('fs');
const path = require('path');

const projectRoot = __dirname; // Replace with your project root directory
const fileExtensionsToCheck = ['.js', '.vue'];

// Define your alias mappings here
const aliasMappings = {
  '@': './src',
  // Add more aliases as needed
};

function resolveAlias(importPath, filePath) {
  // Check if the import path starts with an alias
  for (const alias in aliasMappings) {
    if (importPath.startsWith(alias)) {
      const aliasPath = importPath.replace(alias, aliasMappings[alias]);
      const fullPath = path.join(projectRoot, aliasPath);
      if (fs.existsSync(fullPath + '.js') || fs.existsSync(fullPath + '.vue')) {
        // Determine the correct extension based on what's present in the project
        const jsPath = fullPath + '.js';
        const vuePath = fullPath + '.vue';
        if (fs.existsSync(jsPath)) {
          return jsPath;
        } else if (fs.existsSync(vuePath)) {
          return vuePath;
        }
      }
    }
  }
  return null;
}

function shortenPathWithAliases(importPathWithExtension, filePath) {
  const dirPath = path.dirname(filePath);
  const relativePath = path.relative(projectRoot, path.resolve(dirPath, importPathWithExtension));

  for (const alias in aliasMappings) {
    const aliasPath = aliasMappings[alias];
    const normalizedRelativePath = relativePath.startsWith('./') ? relativePath : `./${relativePath}`;
    const normalizedAliasPath = aliasPath.startsWith('./') ? aliasPath : `./${aliasPath}`;

    if (normalizedRelativePath.startsWith(normalizedAliasPath)) {
      // Append the subpath after the alias to the alias path
      const subpath = normalizedRelativePath.substring(normalizedAliasPath.length);
      const resultPath = path.join(alias, subpath).replace(/\\/g, '/');
      return resultPath;
    }
  }
  return importPathWithExtension; // Use the original path
}



function addFileExtensionsToImports(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  let updatedCount = 0;

  const updatedContent = fileExtensionsToCheck.reduce((content, extension) => {
    // Regular expression to find import statements without extensions
    const importRegex = new RegExp(`from\\s+(['"])([^'"]+)\\1`, 'g');
    const updated = content.replace(importRegex, (match, quote, importPath) => {
      // Skip external library imports (those not starting with '.' or '/')
      if (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.startsWith('@')) {
        return match;
      }

      let importPathWithExtension = importPath + extension;

      // Check if the import path starts with an alias
      const resolvedPath = resolveAlias(importPath, filePath);
      if (resolvedPath) {
        importPathWithExtension = importPath.replace(importPath, path.relative(path.dirname(filePath), resolvedPath));
        updatedCount++;
      } else {
        const importPathWithFullPath = path.join(path.dirname(filePath), importPathWithExtension);

        // Check if the file with the extension exists
        if (fs.existsSync(importPathWithFullPath)) {
          updatedCount++;
        } else {
          return match; // Return unchanged import statement if the file doesn't exist
        }
      }

      return `from ${quote}${shortenPathWithAliases(importPathWithExtension, filePath)}${quote}`;
    });

    return updated;
  }, fileContent);

  if (updatedCount > 0) {
    console.log(`Updated file: ${filePath}, Updated import statements: ${updatedCount}`);
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
  }
}

function processFilesInDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      processFilesInDirectory(filePath);
    } else if (fileExtensionsToCheck.some(extension => filePath.endsWith(extension))) {
      addFileExtensionsToImports(filePath);
    }
  });
}

processFilesInDirectory(projectRoot);
