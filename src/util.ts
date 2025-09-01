import * as vscode from 'vscode';

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

/**
 * generateGUID
 *
 * @return string
 */
function generateGUID(): string {
    return `{${generateRandomHex(8)}-${generateRandomHex(4)}-${generateRandomHex(4)}-${generateRandomHex(4)}-${generateRandomHex(12)}}`;
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
