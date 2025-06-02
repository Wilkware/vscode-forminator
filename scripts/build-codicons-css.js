const fs = require('fs');
const path = require('path');

const from = path.resolve(__dirname, '../node_modules/@vscode/codicons/dist');
const to = path.resolve(__dirname, '../resources');

['codicon.css', 'codicon.ttf'].forEach(file =>
  fs.copyFileSync(path.join(from, file), path.join(to, file))
);