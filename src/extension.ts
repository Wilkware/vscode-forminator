import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { translations } from './translations';
import { items } from './items';
import { icons } from './icons';
import { renderSettingsForm, renderFormData } from './settings';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('symconForm.sidebar', {
            resolveWebviewView(webviewView) {
                webviewView.webview.options = { enableScripts: true };
                webviewView.webview.html = getWebviewContent(webviewView.webview, context.extensionUri);
                webviewView.webview.onDidReceiveMessage(async (message) => {
                    if (message.command === 'insertItem') {
                        const editor = vscode.window.activeTextEditor;
                        if (editor) {
                            const rendered = renderFormData(message.data);
                            const formatted = JSON.stringify(rendered, null, 4);
                            const snippet = new vscode.SnippetString(',\n' + formatted + '$0');
                            editor.insertSnippet(snippet);
                        }
                    }
                    if (message.command === 'requestSettings') {
                        const html = renderSettingsForm(message.item);
                        webviewView.webview.postMessage({ command: 'renderSettings', item: message.item, html });
                    }
                });
            }
        })
    );

    vscode.workspace.onDidOpenTextDocument((doc) => {
        if (doc.fileName.endsWith("form.json")) {
            vscode.commands.executeCommand("workbench.view.extension.symconForm");
        }
    });

    const activeFile = vscode.window.activeTextEditor?.document.fileName;
    if (activeFile && activeFile.endsWith("form.json")) {
        vscode.commands.executeCommand("workbench.view.extension.symconForm");
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('symconForm.addTranslationToLocale', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage(vscode.l10n.t('No active editor.'));
                return;
            }

            const selection = editor.selection;
            const selectedText = editor.document.getText(selection).replace(/^"|"$/g, ''); // remove quotes

            if (!selectedText) {
                vscode.window.showWarningMessage(vscode.l10n.t('Please select some text!'));
                return;
            }

            const translation = await vscode.window.showInputBox({
                prompt: vscode.l10n.t('Translation for "{0}"', selectedText),
                placeHolder: vscode.l10n.t('e.g. My label')
            });

            if (!translation) return;

            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage(vscode.l10n.t('No workspace open.'));
                return;
            }

            const currentFile = editor.document.uri.fsPath;
            const folderPath = path.dirname(currentFile);
            const localePath = path.join(folderPath, 'locale.json');

            let locale: any = { translations: { de: {} } };

            try {
                const content = await fs.promises.readFile(localePath, 'utf-8');
                locale = JSON.parse(content);
            } catch {
                // Datei existiert nicht – neu anlegen
            }

            locale.translations ??= {};
            locale.translations.de ??= {};
            locale.translations.de[selectedText] = translation;

            try {
                await fs.promises.writeFile(localePath, JSON.stringify(locale, null, 4), 'utf-8');
                vscode.window.showInformationMessage(vscode.l10n.t('Translation for \"{0}\" has been added.', selectedText));
            } catch (err: any) {
                vscode.window.showErrorMessage(vscode.l10n.t('Error writing locale.json: {0}', err.message));
            }
        }));
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const locale = vscode.env.language;
    const lang = (locale in translations ? locale : 'en') as keyof typeof translations;
    const t = translations[lang];

    const elementsCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'resources', 'elements-lite.css')
    );

    const codiconsCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'resources', 'codicon.css')
    );

    const buttonsHtml = Object.keys(items)
        .map(key => {
            const title = t[key] || key;
            const icon = icons[key] ?? "question"; // fallback für unbekannte Keys
            return `<button class="vscode-button card" onclick="selectItem('${key}')" title="${title}"><i class="codicon codicon-${icon}"></i>${key}</button>`;
        })
        .join('\n');

    return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <link href="${elementsCssUri}" rel="stylesheet" />
    <link href="${codiconsCssUri}" rel="stylesheet" />
    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: sans-serif;
            box-sizing: border-box;
        }

        *, *::before, *::after {
            box-sizing: inherit;
        }

        #container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        #toolbar, #settings {
            overflow: auto;
            flex: none;
            padding: 10px;
        }

        #resizer {
            background-color: var(--vscode-widget-border);
            border: 0;
            display: block;
            height: 2px;
            cursor: row-resize;
        }

        #resizer:active {
            height: 4px;
            background-color: var(--vscode-focusBorder);
        }

        button.vscode-button.card {
            background-color: #24625B;
            margin: 0px 0px 4px 0px;
            flex-direction: column;
            padding: 4px;
            text-align: center;
            min-width: 28vW;
            font-size: 9px;
        }

        label {
            display: grid;
            padding-bottom: 10px;
        }

        .vscode-check {
            display: inline-flex;
            align-items: center;
        }

        .vscode-check input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            outline: none;
        }

        .vscode-check input[type="checkbox"]:focus {
            border-color: var(--vscode-focusBorder);
        }

        .vscode-check label {
            cursor: pointer;
            display: contents;
            line-height: 18px;
        }

        .vscode-check .text {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="toolbar">
            ${buttonsHtml}
        </div>
        <div id="resizer"></div>
        <div id="settings">
            <em>${t.prompt}</em>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const items = ${JSON.stringify(items)};

        const toolbar = document.getElementById('toolbar');
        const settings = document.getElementById('settings');
        const resizer = document.getElementById('resizer');
        const container = document.getElementById('container');

        // Resizing-Logik
        let isResizing = false;
        let startY = 0;
        let startSettingsHeight = 0;

        // Initialhöhe in px setzen (60/40 Aufteilung)
        window.addEventListener('load', () => {
            const containerHeight = container.offsetHeight;
            const resizerHeight = resizer.offsetHeight;

            const toolbarHeight = Math.floor(containerHeight * 0.6);
            const settingsHeight = containerHeight - toolbarHeight - resizerHeight;

            toolbar.style.height = toolbarHeight + 'px';
            settings.style.height = settingsHeight + 'px';
        });

        resizer.addEventListener('mousedown', e => {
            isResizing = true;
            startY = e.clientY;
            startSettingsHeight = settings.offsetHeight;
            document.body.style.cursor = 'row-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', e => {
            if (!isResizing) return;
            const delta = e.clientY - startY;
            const newSettingsHeight = startSettingsHeight - delta;

            const containerHeight = container.offsetHeight;
            const resizerHeight = resizer.offsetHeight;
            const maxSettingsHeight = containerHeight - resizerHeight - 50; // mind. 50px für toolbar

            // Begrenzung
            if (newSettingsHeight < 50 || newSettingsHeight > maxSettingsHeight) return;

            settings.style.height = newSettingsHeight + 'px';
            toolbar.style.height = (containerHeight - resizerHeight - newSettingsHeight) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.body.style.cursor = 'default';
        });

        function selectItem(key) {
            // Renderer vom Backend anfordern
            vscode.postMessage({ command: 'requestSettings', item: key });
        }

        function insertItem() {
            const item = settings.dataset.item;
            console.log('Item:' + item);
            const fields = document.querySelectorAll('input, select, textarea');
            const data = { type: item };
            fields.forEach(field => {
                const key = field.getAttribute('data-key');
                if (!key) return; // Überspringen, wenn kein data-key gesetzt
                if (field instanceof HTMLInputElement) {
                    if (field.type === 'checkbox') {
                        data[key] = field.checked;
                    } else {
                        data[key] = field.value;
                    }
                } else if (field instanceof HTMLSelectElement) {
                    data[key] = field.value;
                } else if (field instanceof HTMLTextAreaElement) {
                    data[key] = field.value;
                }
            });
            console.log(data);
            vscode.postMessage({ command: 'insertItem', data });
        }

        // Empfangene Nachrichten verarbeiten
        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.command === 'renderSettings') {
                const html = msg.html + '<button type="button" class="vscode-button block" onClick="insertItem()"><i class="codicon codicon-diff-added"></i><span>${t.add}</span></button>'
                settings.innerHTML = html;
                settings.dataset.item = msg.item;
            }
        });
    </script>
</body>
</html>
`;
}
