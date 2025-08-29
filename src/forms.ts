import * as vscode from 'vscode';
import { items } from './form/items';
import { icons } from './form/icons';
import { translations } from './form/translations';
import { renderSettingsForm, renderFormData } from './form/settings';

/**
 * registerFormSidebar - Registers the sidebar web view for Symcon form elements.
 * 
 * @param context VS Code Extension Context
 */
export function registerFormSidebar(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('symconForm.sidebar', {
            resolveWebviewView(webviewView) {
                // Prepare web view
                webviewView.webview.options = { enableScripts: true };
                webviewView.webview.html = getWebviewContent(webviewView.webview, context.extensionUri);

                // Receive notifications from Webview
                webviewView.webview.onDidReceiveMessage(async (message) => {
                    switch (message.command) {
                        case 'insertItem': {
                            const editor = vscode.window.activeTextEditor;
                            if (!editor) return;
                            const rendered = renderFormData(message.data);
                            insertElement(editor, rendered);
                            break;
                        }
                        case 'requestSettings': {
                            const html = renderSettingsForm(message.item);
                            webviewView.webview.postMessage({
                                command: 'renderSettings',
                                item: message.item,
                                html
                            });
                            break;
                        }
                        default:
                            console.warn(`Unbekannter Befehl empfangen: ${message.command}`);
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
}

/**
 * insertElement - Smart insert function for elements (JSON arrays)
 *
 * @param editor: vscode.TextEditor
 * @param newElement: object
 */
function insertElement(editor: vscode.TextEditor, newElement: object) {
    const doc = editor.document;
    const pos = editor.selection.active;
    const text = doc.getText();
    const offset = doc.offsetAt(pos);

    // Helper function: Find array boundaries
    function findArrayAtPosition(text: string, offset: number): { start: number; end: number } | null {
        const stack: number[] = [];
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '[') stack.push(i);
            if (text[i] === ']') {
                const start = stack.pop();
                if (start !== undefined && start <= offset && offset <= i) {
                    return { start, end: i };
                }
            }
        }
        return null;
    }

    const arrayRange = findArrayAtPosition(text, offset);
    if (!arrayRange) {
        vscode.window.showErrorMessage('Kein gültiges Array an der Cursor-Position gefunden.');
        return;
    }

    const arrayText = text.substring(arrayRange.start, arrayRange.end + 1);

    let arrayData: any[];
    try {
        arrayData = JSON.parse(arrayText);
    } catch (err) {
        vscode.window.showErrorMessage('Fehler beim Parsen des Arrays.');
        return;
    }

    // Determine indentation of the current line
    const arrayLine = doc.positionAt(arrayRange.start).line;
    const lineText = doc.lineAt(arrayLine).text;
    const baseIndentMatch = lineText.match(/^(\s*)/);
    const baseIndent = baseIndentMatch ? baseIndentMatch[1] : '';
    const indent = baseIndent + '    ';

    // Cursor position relative to the array
    const cursorOffsetInArray = offset - arrayRange.start;

    // Find position in array
    let insertIndex = arrayData.length; // Standard: to the end
    let currentOffset = 1; // Start after '['
    for (let i = 0; i < arrayData.length; i++) {
        const elementString = JSON.stringify(arrayData[i], null, 4);
        const elementLength = elementString.length;
        if (cursorOffsetInArray <= currentOffset + elementLength / 2) {
            insertIndex = i;
            break;
        }
        currentOffset += elementLength + 1; // +1 for comma
    }

    // Insert new element
    arrayData.splice(insertIndex, 0, newElement);

    // Reformat
    const formattedArray =
        '[\n' +
        arrayData
            .map(el => indent + JSON.stringify(el, null, 4).replace(/\n/g, '\n' + indent))
            .join(',\n') +
        '\n' +
        baseIndent +
        ']';

    const range = new vscode.Range(
        doc.positionAt(arrayRange.start),
        doc.positionAt(arrayRange.end + 1)
    );

    editor.edit(editBuilder => {
        editBuilder.replace(range, formattedArray);
    });
}

/**
 * getWebviewContent
 *
 * @param webview: vscode.Webview
 * @param extensionUri: vscode.Uri
 * 
 * @return string
 */
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
            const icon = icons[key] ?? "question"; // fallback for unknown keys
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
            console.log('Insert:', data);
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