import * as vscode from 'vscode';
import { items } from './form/items';
import { icons } from './form/icons';
import { translations } from './form/translations';
import { renderSettingsForm, renderFormData } from './form/settings';


let propertiesWebview: vscode.WebviewView | null = null;

/**
 * registerFormSidebar - Registers the sidebar web view for Symcon form elements.
 * 
 * @param context VS Code Extension Context
 */
export function registerFormSidebar(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('openSidebar', () => {
            vscode.commands.executeCommand('workbench.view.extension.symconForm');
        })
    );
    // View 1: Elements
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('symconForm.elements', {
            resolveWebviewView(webviewView) {
                // Prepare web view
                webviewView.webview.options = { enableScripts: true };
                webviewView.webview.html = getWebviewElementsContent(webviewView.webview, context.extensionUri);
                // Receive notifications from Webview (View 1)
                webviewView.webview.onDidReceiveMessage(async (message) => {
                    switch (message.command) {
                        case 'requestSettings':
                            // View1 gas selected a element → render properties in View2
                            if (propertiesWebview) {
                                const html = renderSettingsForm(message.item);
                                propertiesWebview.webview.postMessage({
                                    command: 'renderSettings',
                                    item: message.item,
                                    html
                                });
                            }
                            break;
                        default:
                            console.warn(`Elements panel received unknown command: ${message.command}`);
                            break;
                    }
                });
            }
        })
    );
    // View 2: Properties
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('symconForm.properties', {
            resolveWebviewView(webviewView) {
                propertiesWebview = webviewView;
                webviewView.webview.options = { enableScripts: true };
                webviewView.webview.html = getWebviewPropertiesContent(webviewView.webview, context.extensionUri);
                // Receive notifications from Webview (View 2)
                webviewView.webview.onDidReceiveMessage(async (message) => {
                    switch (message.command) {
                        case 'insertItem':
                            const editor = vscode.window.activeTextEditor;
                            if (!editor) {
                                vscode.window.showInformationMessage(vscode.l10n.t('No active editor.'));
                                return;
                            }
                            const file = editor.document.fileName;
                            if (!file.endsWith('form.json')) {
                                vscode.window.showWarningMessage(vscode.l10n.t('Please open the form JSON file (form.json) before adding an element.'));
                                return;
                            }

                            const rendered = renderFormData(message.data);
                            insertElement(editor, rendered);
                            break;
                        default:
                            console.warn(`Properties panel received unknown command: ${message.command}`);
                            break;
                    }
                });
            }
        })
    );
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
        vscode.window.showErrorMessage(vscode.l10n.t('No valid array found at the cursor position.'));
        return;
    }

    const arrayText = text.substring(arrayRange.start, arrayRange.end + 1);

    let arrayData: any[];
    try {
        arrayData = JSON.parse(arrayText);
    } catch (err) {
        vscode.window.showErrorMessage(vscode.l10n.t('Error parsing the array.'));
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
 * getWebviewElementsContent
 *
 * @param webview: vscode.Webview
 * @param extensionUri: vscode.Uri
 * 
 * @return string
 */
function getWebviewElementsContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const locale = vscode.env.language;
    const lang = (locale in translations ? locale : 'en') as keyof typeof translations;
    const t = translations[lang];

    const elementsCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'resources', 'elements-lite.css')
    );

    const codiconsCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'resources', 'codicon.css')
    );

    const sidebarCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'resources', 'sidebar.css')
    );

    const buttonsHtml = Object.keys(items)
        .map(key => {
            const title = t[key] || key;
            const icon = icons[key] ?? "question"; // fallback for unknown keys
            return `<button class="vscode-button card" onclick="selectItem('${key}')" title="${title}"><i class="codicon codicon-${icon}"></i>${key}</button>`;
        }).join('\n');

    return `
<!doctype html>
<html lang="${locale}">
<head>
    <meta charset="utf-8">
    <link href="${elementsCssUri}" rel="stylesheet" />
    <link href="${codiconsCssUri}" rel="stylesheet" />
    <link href="${sidebarCssUri}" rel="stylesheet" />
</head>
<body>
    <div id="container">
        <div id="toolbar">
            ${buttonsHtml}
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        function selectItem(key) {
            // Renderer vom Backend anfordern
            vscode.postMessage({ command: 'requestSettings', item: key });
        }
    </script>
</body>
</html>
`;
}

/**
 * getWebviewPropertiesContent
 *
 * @param webview: vscode.Webview
 * @param extensionUri: vscode.Uri
 *
 * @return string
 */
export function getWebviewPropertiesContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const locale = vscode.env.language;
    const lang = (locale in translations ? locale : 'en') as keyof typeof translations;
    const t = translations[lang];

    const elementsCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'resources', 'elements-lite.css')
    );

    const codiconsCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'resources', 'codicon.css')
    );

    const sidebarCssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'resources', 'sidebar.css')
    );

    return `
<!doctype html>
<html lang="${locale}">
<head>
    <meta charset="utf-8">
    <link href="${elementsCssUri}" rel="stylesheet" />
    <link href="${codiconsCssUri}" rel="stylesheet" />
    <link href="${sidebarCssUri}" rel="stylesheet" />
</head>
<body>
    <div id="container">
        <div id="settings">
            <em>${t.prompt}</em>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const settings = document.getElementById('settings');

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