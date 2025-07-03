# Forminator - VSCode Extension

Eine Visual Studio Code Erweiterung zur Unterstützung bei der Erstellung von `forms.json` Dateien für Symcon Module.

## Features

- Sidebar mit allen verfügbaren Form-Elementen (Label, CheckBox, usw.)
- Per einfachen Klick wird ein JSON-Snippet an der Cursorposition eingefügt

## Entwicklung

```bash
npm install
# (optional start)
npm run build:elements-css
npm run build:codicons-css
# (optional end)
```
Dann F5 drücken, um im Extension Development Host zu starten.

## VSIX-Paket erstellen

```bash
vsce package
# forminator-x.y.z.vsix
```

## Die VSIX installieren

In VS Code: Öffne die Command Palette (Strg+Shift+P oder F1)

```vbnet
Extensions: Install from VSIX...
' oder 
Erweiterung: Aus VSIX installieren...
```