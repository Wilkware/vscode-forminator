// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
// Import the module and reference it with the alias vscode in your code below
import { registerFormSidebar } from './forms';
import { registerAddTranslation } from './locales';
import { registerPreviewPanel } from './previews';
import { registerAssignSplitter } from './splitter';
import { registerInsertProperties } from './properties';
import { registerInsertGuid, registerUpdateBuild} from './util';
import { registerModuleWizard, registerLibraryWizard } from './wizard';

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

    // Menu & Command:registerAssignSplitter initialise
    registerAssignSplitter(context);

    // Command:updateBuildInfo initialise
    registerUpdateBuild(context);
    
    // Command:startLibraryWizard initialise
    registerLibraryWizard(context);

    // Command:startModuleWizard initialise
    registerModuleWizard(context);
}

 /**
  * deactivate - This method is called when your extension is deactivated
  *
  */
export function deactivate() { 
    console.log('Symcon Modul Helper Extension deaktiviert.');
}
