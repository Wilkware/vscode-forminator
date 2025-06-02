// scripts/build-elements-lite-css.js
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../node_modules/@vscode-elements/elements-lite/components');
const outputFile = path.resolve(__dirname, '../resources/elements-lite.css');

let combinedCss = '';

function readCssRecursive(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      readCssRecursive(fullPath);
    } else if (file.endsWith('.css')) {
      const css = fs.readFileSync(fullPath, 'utf8');
      combinedCss += `\n/* ${path.relative(baseDir, fullPath)} */\n` + css;
    }
  }
}

readCssRecursive(baseDir);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, combinedCss);

console.log(`✅ CSS kombiniert in ${outputFile}`);
