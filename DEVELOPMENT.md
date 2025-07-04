# Development Guide for Symcon Form Helper

## Project Structure

- `src/` – Extension source code (TypeScript)
- `scripts/` – (pre)Build scripts
- `resources/` – Webview resources (styles, fonts, images)
- `doc/` – Documentation files (screenshots etc.)
- `translations.ts` – Localized UI strings
- `icons.ts` – Icon assoziation of elements
- `items.ts` – Field and element definitions
- `settings.ts` – Render field settings
- `translations.ts` – Language translations

## Scripts

- `npm install` – install dependencies
- `npm run compile` – compile TypeScript
- `npm run watch` – compile in watch mode
- `npm run vscode:prepublish` – prepare for publishing
- `npm run build:elements-css` – create elements-lite.css
- `npm run build:codicons-css` – create codicons.css and codicons.ttf
- `npx vsce package` – create `.vsix` file

## Packaging

Make sure your `.vscodeignore` is set to exclude dev-only files like:

```
.vscode/
.git/
.gitignore
node_modules/
src/
scripts/
test/
*.ts
*.map
tsconfig.json
package-lock.json
vscode-forminator.code-workspace
.vscodeignore
```

Or specify `"files"` in `package.json` to include only what's necessary.

## Testing the Extension

You can run and debug your extension using the "Run Extension" target in VS Code. Make sure `sourceMaps` is enabled in your `launch.json`.

## Publishing

1. Install [vsce](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) CLI.
2. Run `npx vsce login <publisher>`
3. Run `npx vsce publish`

You’ll need a verified publisher and a valid PAT (personal access token).

