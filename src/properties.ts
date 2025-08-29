import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

 /**
  * registerInsertProperties - Registers the command for RegisterProperty functions in Create.
  *
  * @param context: vscode.ExtensionContext
  */
export function registerInsertProperties(context: vscode.ExtensionContext) {
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

 /**
  * insertIntoCreate
  *
  * @param phpEditor: vscode.TextEditor
  * @param phpCalls: string[]
  * 
  * @return Promise
  */
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

/**
 * generateRegisterPropertyCalls
 *
 * @param formJson: any
 * 
 * @return string
 */
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

/**
 * Strukture of a select element (caption + value)
 */
interface SelectOption {
  caption?: string;
  value?: string | number;
}

// Extract option-values from a select element
/**
 * getSelectValues
 *
 * @param mixed el:
 */
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

/**
 * detectSelectValueType - Determine data type of values: 'int' | 'float' | 'string'
 *
 * @param values: (string
 */
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

/**
 * escapeForRegex - Minimal regex-escape
 *
 * @param s: string
 */
function escapeForRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
