import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

 /**
  * registerAddTranslation - Register menu command for adding translations
  *
  * @param context: vscode.ExtensionContext
  */
export function registerAddTranslation(context: vscode.ExtensionContext) {
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
                // File does not exist – create new
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
        )
    );
}