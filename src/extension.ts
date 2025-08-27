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
                        if (!editor) return;
                        const rendered = renderFormData(message.data);
                        insertElement(editor, rendered);
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
        }
        ));

    context.subscriptions.push(
        vscode.commands.registerCommand('symconForm.insertRegisterProperties', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage(vscode.l10n.t('No active editor.'));
                return;
            }

            const doc = activeEditor.document;
            if (doc.languageId !== 'php') {
                vscode.window.showErrorMessage(vscode.l10n.t('Please open the module PHP file (module.php) before running this command.'));
                return;
            }

            try {
                const moduleDir = path.dirname(doc.uri.fsPath);

                // Search form.json on the same level
                let formPath: string | undefined;
                const p = path.join(moduleDir, 'form.json');
                if (fs.existsSync(p)) {
                    formPath = p;
                }

                if (!formPath) {
                    vscode.window.showErrorMessage(vscode.l10n.t('No form.json found in the same folder as the PHP module.'));
                    return;
                }

                const jsonText = fs.readFileSync(formPath, 'utf-8');
                let formJson: any;
                try {
                    formJson = JSON.parse(jsonText);
                } catch (err: any) {
                    vscode.window.showErrorMessage(vscode.l10n.t('Could not parse form json: ') + err.message);
                    return;
                }

                // Creates PHP-Calls
                const phpCalls = generateRegisterPropertyCalls(formJson);
                if (phpCalls.length === 0) {
                    vscode.window.showInformationMessage(vscode.l10n.t('No RegisterProperty calls generated from form.json.'));
                    return;
                }

                // Insert in Create()
                const inserted = await insertIntoCreate(activeEditor, phpCalls);
                if (inserted > 0) {
                    vscode.window.showInformationMessage(vscode.l10n.t('Inserted {0} RegisterProperty call(s) into Create().', inserted));
                } else {
                    vscode.window.showInformationMessage(vscode.l10n.t('No new RegisterProperty calls inserted (all already present).'));
                }
            } catch (err: any) {
                vscode.window.showErrorMessage(vscode.l10n.t('Unexpected error: ') + err.message);
                console.error(err);
            }
        })
    );
}

export function deactivate() { }

async function insertIntoCreate(phpEditor: vscode.TextEditor, phpCalls: string[]): Promise<number> {
    const doc = phpEditor.document;
    const text = doc.getText();

    // find Create() method (public/protected/private)
    const createRegex = /(?:public|protected|private)\s+function\s+Create\s*\(\s*\)\s*(?::\s*[\w\\|?]+)?\s*\{/;

    const m = createRegex.exec(text);
    if (!m) {
        vscode.window.showErrorMessage('No Create() method found in PHP file.');
        return 0;
    }

    const startOffset = m.index + m[0].length;
    // find matching closing brace
    let open = 1;
    let offset = startOffset;
    while (offset < text.length && open > 0) {
        const ch = text[offset++];
        if (ch === '{') open++;
        else if (ch === '}') open--;
    }
    if (open !== 0) {
        vscode.window.showErrorMessage('Could not match braces of Create() function.');
        return 0;
    }

    const createBodyStart = startOffset;
    const createBodyEnd = offset - 1; // offset is one past matched closing brace
    const createBody = text.slice(createBodyStart, createBodyEnd);

    // determine indentation used inside Create(): look for first non-empty line inside body
    let indent = '    '; // fallback 4 spaces
    const bodyLines = createBody.split(/\r?\n/);
    for (const line of bodyLines) {
        const t = line.trim();
        if (t.length > 0) {
            const mIndent = line.match(/^\s*/);
            if (mIndent) indent = mIndent[0];
            break;
        }
    }

    // filter out calls that are already present
    const callsToInsert: string[] = [];
    for (const call of phpCalls) {
        // extract identifier from call: find first "..." after (
        const identMatch = call.match(/RegisterProperty\w+\s*\(\s*["']([^"']+)["']/);
        const ident = identMatch ? identMatch[1] : null;
        let already = false;
        if (ident) {
            // search for existing RegisterProperty lines with same ident in createBody
            const esc = escapeForRegex(ident);
            const reg = new RegExp(`RegisterProperty\\w+\\s*\\(\\s*['"]${esc}['"]`);
            already = reg.test(createBody);
        } else {
            // fallback: if exact line exists
            already = createBody.includes(call);
        }
        if (!already) callsToInsert.push(call);
    }

    if (callsToInsert.length === 0) {
        return 0;
    }

    // prepare code block with indentation
    const padded = callsToInsert.map(c => indent + c).join('\n') + '\n';

    // insert right before the closing brace position (createBodyEnd is offset-1)
    const insertPos = doc.positionAt(createBodyEnd);
    await phpEditor.edit(editBuilder => {
        // ensure a blank line before inserted code for readability
        editBuilder.insert(insertPos, '\n' + padded);
    });

    return callsToInsert.length;
}

// Intelligente Einfügefunktion für Elemente (JSON-Arrays)
function insertElement(editor: vscode.TextEditor, newElement: object) {
    const doc = editor.document;
    const pos = editor.selection.active;
    const text = doc.getText();
    const offset = doc.offsetAt(pos);

    // Hilfsfunktion: Array-Grenzen finden
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

    // Einrückung der aktuellen Zeile ermitteln
    const arrayLine = doc.positionAt(arrayRange.start).line;
    const lineText = doc.lineAt(arrayLine).text;
    const baseIndentMatch = lineText.match(/^(\s*)/);
    const baseIndent = baseIndentMatch ? baseIndentMatch[1] : '';
    const indent = baseIndent + '    ';

    // Cursorposition relativ zum Array
    const cursorOffsetInArray = offset - arrayRange.start;

    // Position im Array finden
    let insertIndex = arrayData.length; // Standard: ans Ende
    let currentOffset = 1; // Start nach der '['
    for (let i = 0; i < arrayData.length; i++) {
        const elementString = JSON.stringify(arrayData[i], null, 4);
        const elementLength = elementString.length;
        if (cursorOffsetInArray <= currentOffset + elementLength / 2) {
            insertIndex = i;
            break;
        }
        currentOffset += elementLength + 1; // +1 für das Komma
    }

    // Neues Element einfügen
    arrayData.splice(insertIndex, 0, newElement);

    // Neu formatieren
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


function generateRegisterPropertyCalls(formJson: any): string[] {
    const calls: { ident: string; code: string }[] = [];

    function escapePHP(s: string) {
        return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    function addCall(ident: string, value: string, fn?: string) {
        if (!ident) return;
        const useIdent = String(ident);
        const useValue = String(value);

        // choose default fn if not provided
        const method = fn ?? 'RegisterPropertyString';
        const quotes = method === 'RegisterPropertyString';
        const code = `$this->${method}('${escapePHP(useIdent)}', ${quotes ? `'${escapePHP(useValue)}'` : useValue});`;
        // ensure unique by ident
        if (!calls.find(c => c.ident === useIdent)) calls.push({ ident: useIdent, code });
    }

    function mapElementToCall(el: any) {
        if (!el || typeof el !== 'object') return;

        // we require a name (ident) to register
        const ident = el.name;
        // decide on method
        let method: string | null = null;
        let value: string;
        // element typ
        const t = (el.type ?? '').toString();

        switch (t) {
            case 'CheckBox':
                method = 'RegisterPropertyBoolean';
                value = 'false';
                break;

            case 'ProgressBar':
            case 'NumberSpinner':
                method = 'RegisterPropertyInteger';
                value = '0';
                break;

            case 'DateTimePicker':
            case 'DateTime':
                method = 'RegisterPropertyInteger';
                value = '1';
                break;

            case 'HorizontalSlider':
            case 'ValidationTextBox':
            case 'PasswordTextBox':
            case 'SelectIcon':
            case 'SelectFile':
            case 'SelectProfile':
                method = 'RegisterPropertyString';
                value = '';
                break;

            case 'Select':
                // extract Values (options[].value, values[], items[])
                const vals = getSelectValues(el);
                const type = detectSelectValueType(vals); // 'int' | 'float' | 'string'
                if (type === 'int') {
                    method = 'RegisterPropertyInteger';
                    value = '0';
                } else if (type === 'float') {
                    method = 'RegisterPropertyFloat';
                    value = '0.0';
                } else {
                    method = 'RegisterPropertyString';
                    value = '';
                }
                break;

            case 'SelectCategory':
            case 'SelectEvent':
            case 'SelectInstance':
            case 'SelectLink':
            case 'SelectVariable':
            case 'SelectMedia':
            case 'SelectModule':
            case 'SelectObject':
            case 'SelectScript':
                method = 'RegisterPropertyInteger';
                value = '1';
                break;

            case 'SelectColor':
                method = 'RegisterPropertyInteger';
                value = '-1';
                break;

            case 'Configurator':
            case 'List':
            case 'SelectAction':
            case 'SelectCondition':
            case 'SelectDate':
            case 'SelectDateTime':
            case 'SelectLocation':
            case 'SelectTime':
            case 'SelectValue':
            case 'Tree':
                method = 'RegisterPropertyString';
                value = '[]';
                break;


            case 'Button':
            case 'ColumnLayout':
            case 'ExpansionPanel':
            case 'Image':
            case 'Label':
            case 'OpenObjectButton':
            case 'PopupAlert':
            case 'PopupButton':
            case 'QrCode':
            case 'RowLayout':
            case 'ScriptEditor':
            case 'StatusMessage':
            case 'TestCenter':
                method = null; // skip UI/layout-only elements
                value = '';
                break;

            default:
                // fallback heuristics: if element references a variable or profileType -> choose int/float
                if (el.profileType === 1) method = 'RegisterPropertyFloat';
                else if (el.profileType === 2) method = 'RegisterPropertyBoolean';
                else method = 'RegisterPropertyString';
                value = '';
                break;
        }

        if (method && ident) {
            addCall(ident, value, method);
        }
    }

    // walk recursively: elements arrays, items arrays, rows/columns etc.
    function walk(node: any) {
        if (!node) return;
        if (Array.isArray(node)) {
            for (const e of node) {
                walk(e);
            }
            return;
        }
        if (typeof node === 'object') {
            // if node looks like a form element (has type or name), process
            if (node.type) {
                mapElementToCall(node);
            }
            // common nested containers
            const childKeys = ['elements', 'items'];
            for (const k of childKeys) {
                if (Array.isArray(node[k])) {
                    walk(node[k]);
                }
            }
            // also explore all object properties recursively (defensive)
            for (const key of Object.keys(node)) {
                const v = node[key];
                if (Array.isArray(v) || (v && typeof v === 'object' && (v.type || v.elements || v.items))) {
                    walk(v);
                }
            }
        }
    }

    // entry points: many symcon forms put items directly under formJson.elements or formJson.items
    if (Array.isArray(formJson.elements)) walk(formJson.elements);
    else if (Array.isArray(formJson.items)) walk(formJson.items);
    else walk(formJson);

    // return the code strings
    return calls.map(c => c.code);
}

// Strukture of a select element (caption + value)
interface SelectOption {
  caption?: string;
  value?: string | number;
}

// Extract option-values from a select element
function getSelectValues(el: any): (string | number)[] {
  if (!el) return [];

  if (Array.isArray(el.options)) {
    return el.options
      .map((o: SelectOption) => o?.value)
      .filter((v: string | number | undefined): v is string | number => v !== undefined);
  }

  if (Array.isArray(el.values)) {
    return el.values as (string | number)[];
  }

  return [];
}

// Determine data type of values: 'int' | 'float' | 'string'
function detectSelectValueType(values: (string | number)[]): 'int' | 'float' | 'string' {
  if (values.length === 0) return 'string';

  let allInt = true;
  for (const v of values) {
    const vs = typeof v === 'string' ? v.trim() : v;
    if (vs === '') return 'string';

    const n = Number(vs);
    if (!Number.isFinite(n)) {
      return 'string';
    }
    if (!Number.isInteger(n)) {
      allInt = false;
    }
  }

  return allInt ? 'int' : 'float';
}

// Minimal regex-escape
function escapeForRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
