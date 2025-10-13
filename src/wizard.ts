import * as vscode from 'vscode';
import { WebviewWizard, WizardDefinition, IWizardPage, PerformFinishResponse, StandardWizardPageRenderer, BUTTONS, IWizardWorkflowManager } from '@redhat-developer/vscode-wizard';
import { ProjectPage } from './wizard/project';
import { LibraryPage } from './wizard/library';
import { CodingPage } from './wizard/coding';
import { ModulePage, loadModulesFromWorkspace } from './wizard/module';
import { createLibrary, createModule} from './wizard/templates';

/**
 * Registriert den Bibliotheks-Wizard
 *
 * @param context: vscode.ExtensionContext - Der Extension-Kontext
 * 
 * @return void
 */
export function registerLibraryWizard(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('startLibraryWizard', async () => {
            const wiz: WebviewWizard = startLibraryWizard(context);
            wiz.open();
        })
    );
}

/**
 * Startet den Modul-Wizard
 *
 * @param context: vscode.ExtensionContext
 * 
 * @return WebviewWizard
 */
function startLibraryWizard(context: vscode.ExtensionContext): WebviewWizard {
    // Wizard-Definition
    const def: WizardDefinition = {
        title: "Neue Modul-Bibliothek",
        description: "Erstellt ein neues Projekt für eine Symcon Modul-Bibliothek.",
        hideWizardHeader: false,
        pages: [ProjectPage, LibraryPage],
        renderer: new StandardWizardPageRenderer(),
        workflowManager: {
            getNextPage(page: IWizardPage, data: any): IWizardPage | null {
                const pageId = page.getId();
                console.log("getNextPage called from page:", pageId, "with data:", data);

                let nextPage = null;
                if (pageId === "project") {
                    nextPage = "library";
                }

                const tmp = page.getWizard();
                if (tmp === null || nextPage === null) {
                    return null;
                }

                return tmp.getPage(nextPage);
            },

            getPreviousPage(page: IWizardPage, data: any): IWizardPage | null {
                const pageId = page.getId();
                console.log("getPreviousPage called from page:", pageId, "with data:", data);

                let prevPage = null;
                if (pageId === "library") {
                    prevPage = "project";
                }

                const tmp = page.getWizard();
                if (tmp === null || prevPage === null) {
                    return null;
                }
                return tmp.getPage(prevPage);
            },

            canFinish(wizard: WebviewWizard, data: any): boolean {
                console.log("❎ canFinish called with data:", data);
                return wizard.currentPage?.getId() === "library";
            },

            performFinish(wizard: WebviewWizard, data: any): Promise<PerformFinishResponse | null> {
                console.log("✅ performFinish called with data:", data);
                vscode.window.showInformationMessage(`Library ${data.libraryName} wird erstellt!`);
                try {
                    createLibrary(context, data);
                } catch (e: any) {
                    vscode.window.showErrorMessage("Fehler beim Erstellen: " + e.message);
                }
                return Promise.resolve(null);
            }
        },
        buttons: [
            { id: BUTTONS.PREVIOUS, label: "Zurück" },
            { id: BUTTONS.NEXT, label: "Weiter" },
            { id: BUTTONS.FINISH, label: "Erstellen und öffnen" },
        ]
    };

    // Wizard erzeugen
    let data = new Map<string, string>();
    const wizard = new WebviewWizard("moduleWizard", "moduleWizard", context, def, data);

    return wizard;
}

/**
 * Registriert den Modul-Wizard
 *
 * @param context: vscode.ExtensionContext - Der Extension-Kontext
 * 
 * @return void
 */
export function registerModuleWizard(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('startModuleWizard', async () => {
            const wiz: WebviewWizard = startModuleWizard(context);
            wiz.open();
        })
    );
}

/**
 * Startet den Modul-Wizard
 *
 * @param context: vscode.ExtensionContext
 * 
 * @return WebviewWizard
 */
function startModuleWizard(context: vscode.ExtensionContext): WebviewWizard {
    // Wizard-Definition
    const def: WizardDefinition = {
        title: "Neues Modul hinzufügen",
        description: "Erstellt ein neues Modul in einem bestehenden Bibliotheks-Projekt.",
        hideWizardHeader: false,
        pages: [ModulePage, CodingPage],
        renderer: new StandardWizardPageRenderer(),
        workflowManager: {
            getNextPage(page: IWizardPage, data: any): IWizardPage | null {
                const pageId = page.getId();
                console.log("getNextPage called from page:", pageId, "with data:", data);

                // next page logic
                let nextPage = null;

                if (pageId === "module") {
                    nextPage = "coding";
                }

                const tmp = page.getWizard();
                if (tmp === null || nextPage === null) {
                    return null;
                }

                return tmp.getPage(nextPage);
            },

            getPreviousPage(page: IWizardPage, data: any): IWizardPage | null {
                const pageId = page.getId();
                console.log("getPreviousPage called from page:", pageId, "with data:", data);

                let prevPage = null;
                if (pageId === "coding") {
                    prevPage = "module";
                }

                const tmp = page.getWizard();
                if (tmp === null || prevPage === null) {
                    return null;
                }
                return tmp.getPage(prevPage);
            },

            canFinish(wizard: WebviewWizard, data: any): boolean {
                console.log("❎ canFinish called with data:", data);
                return wizard.currentPage?.getId() === "coding";
            },

            performFinish(wizard: WebviewWizard, data: any): Promise<PerformFinishResponse | null> {
                console.log("✅ performFinish called with data:", data);
                vscode.window.showInformationMessage(`Modul ${data.moduleName} wird hinzugefügt!`);
                try {
                    createModule(context, data);
                } catch (e: any) {
                    vscode.window.showErrorMessage("Fehler beim Erstellen: " + e.message);
                }
                return Promise.resolve(null);
            }
        },
        buttons: [
            { id: BUTTONS.PREVIOUS, label: "Zurück" },
            { id: BUTTONS.NEXT, label: "Weiter" },
            { id: BUTTONS.FINISH, label: "Hinzufügen" },
        ]
    };

    // Alle bisheriegen Module einsammeln 
    loadModulesFromWorkspace();

    // Wizard erzeugen
    let data = new Map<string, string>();
    const wizard = new WebviewWizard("moduleWizard", "moduleWizard", context, def, data);

    return wizard;
}
