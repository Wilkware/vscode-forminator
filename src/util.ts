import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * registerInsertGuid
 *
 * @param context: vscode.ExtensionContext
 * 
 * @return void
 */
export function registerInsertGuid(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('insertGuidAtPosition', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage(vscode.l10n.t('No active editor.'));
                return;
            }

            const guid = generateGUID();
            editor.edit(editBuilder => {
                const selections = editor.selections;
                for (const selection of selections) {
                    if (!selection.isEmpty) {
                        // Replace the selected text
                        editBuilder.replace(selection, guid);
                    } else {
                        // Insert GUID at cursor position
                        editBuilder.insert(selection.start, guid);
                    }
                }
            });
        })
    );
}

export function registerUpdateBuild(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('updateBuildInfo', async () => {
            try {
                // 1. Offset erfragen
                const daysInput = await vscode.window.showInputBox({
                    prompt: vscode.l10n.t('Offset in days (+/-):'),
                    value: "0",
                    validateInput: (val) => isNaN(Number(val)) ? vscode.l10n.t('Please enter a number!') : null
                });
                if (daysInput === undefined) return; // Abbruch
                const days = parseInt(daysInput.trim()) || 0;

                // 2. Datum berechnen
                const date = new Date();
                date.setDate(date.getDate() + days);
                date.setHours(12, 0, 0, 0);
                const unixTime = Math.floor(date.getTime() / 1000);

                // 3. Workspace prüfen
                const folders = vscode.workspace.workspaceFolders;
                if (!folders || folders.length === 0) {
                    vscode.window.showErrorMessage(vscode.l10n.t('No workspace open.'));
                    return;
                }

                // 4. library.json suchen
                let libraryPath: string | undefined;
                for (const folder of folders) {
                    const candidate = path.join(folder.uri.fsPath, "library.json");
                    if (fs.existsSync(candidate)) {
                        libraryPath = candidate;
                        break;
                    }
                }

                if (!libraryPath) {
                    vscode.window.showErrorMessage(vscode.l10n.t('No library.json found in workspace.'));
                    return;
                }

                // 5. Datei einlesen und aktualisieren
                const raw = fs.readFileSync(libraryPath, "utf-8");
                let json: any;
                try {
                    json = JSON.parse(raw);
                } catch (err) {
                    vscode.window.showErrorMessage(vscode.l10n.t('library.json is not a valid JSON file.'));
                    return;
                }

                // 6. Build-Nummer  bererechnen
                const config = vscode.workspace.getConfiguration('symcon');
                const pattern = config.get<string>("general.build") || "%Y%m%d";
                const build = parseInt(generateBuildInfo(pattern, date, json.version), 10);

                // 7. Datei zurückschreiben (schön formatiert)
                json.build = build;
                json.date = unixTime;

                fs.writeFileSync(libraryPath, JSON.stringify(json, null, 4), "utf-8");

                vscode.window.showInformationMessage(
                    `library.json aktualisiert: build=${build}, date=${unixTime}`
                );
            } catch (e: any) {
                vscode.window.showErrorMessage(vscode.l10n.t('Error writing library.json: {0}', e.message));
            }
        })
    );
}

/**
 * getWorkspaceName - Name of the first (and only) workspace folder
 *
 * @return string
 */
export function getWorkspaceName(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        return workspaceFolders[0].name;
    }
    return undefined;
}

/**
 * generateGUID
 *
 * @return string
 */
export function generateGUID(): string {
    return `{${generateRandomHex(8)}-${generateRandomHex(4)}-${generateRandomHex(4)}-${generateRandomHex(4)}-${generateRandomHex(12)}}`;
}

/**
 * generatetTimestamp
 *
 * @return number
 */
export function generatetTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

/**
 * generateBuildInfo
 *
 * @param pattern: string
 * @param date: Date
 * @param libVersion?: string
 * 
 * @return string
 */
export function generateBuildInfo(pattern: string, date: Date, libVersion?: string): string {
    const replacements: Record<string, string> = {
        "%Y": date.getFullYear().toString(),
        "%y": date.getFullYear().toString().slice(-2),
        "%m": String(date.getMonth() + 1).padStart(2, "0"),
        "%d": String(date.getDate()).padStart(2, "0"),
        "%H": String(date.getHours()).padStart(2, "0"),
        "%M": String(date.getMinutes()).padStart(2, "0"),
        "%S": String(date.getSeconds()).padStart(2, "0"),
        "%j": String(
            Math.floor(
                (date.getTime() -
                    new Date(date.getFullYear(), 0, 0).getTime()) /
                (1000 * 60 * 60 * 24)
            )
        ).padStart(3, "0"),
        "%t": Math.floor(date.getTime() / 1000).toString(),
        "%V": libVersion ? libVersion.split(".")[0] : "",
        "%v": libVersion ? libVersion.split(".")[1] : ""
    };

    return Object.entries(replacements).reduce(
        (acc, [k, v]) => acc.replace(new RegExp(k, "g"), v),
        pattern
    );
}

/**
 * generateRandomHex
 *
 * @param length: number
 * 
 * @return string
 */
function generateRandomHex(length: number): string {
    return Math.floor(Math.random() * Math.pow(16, length))
        .toString(16)
        .padStart(length, '0')
        .toUpperCase();
}
