// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
// Import the module and reference it with the alias vscode in your code below
import { registerFormSidebar } from './forms';
import { registerAddTranslation } from './locales';
import { registerPreviewPanel } from './previews';
import { registerInsertProperties } from './properties';
import { registerInsertGuid} from './util';

 /**
  * activate - This method is called when your extension is activated
  * your extension is activated the very first time the command is executed
  *
  * @param context: vscode.ExtensionContext
  */
export function activate(context: vscode.ExtensionContext) {
    console.log('Symcon Modul Helper Extension aktiviert.');

    // Sidebar initialise
    registerFormSidebar(context);

    // Menu & Command:registerAddTranslation initialise
    registerAddTranslation(context);

    // Command:PreviewPanel initialise
    registerPreviewPanel(context);

    // Command:insertRegisterProperties initialise
    registerInsertProperties(context);

    // Command:registerInsertGuid initialise
    registerInsertGuid(context);
}

 /**
  * deactivate - This method is called when your extension is deactivated
  *
  */
export function deactivate() { 
    console.log('Symcon Modul Helper Extension deaktiviert.');
}
