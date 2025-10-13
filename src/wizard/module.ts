import * as vscode from 'vscode';
import { SEVERITY, ValidatorResponseItem, WizardPageDefinition } from '@redhat-developer/vscode-wizard';
import { generateGUID } from '../util';
import * as fs from 'fs';
import * as path from 'path';

// configuration
const config = vscode.workspace.getConfiguration('symcon');

export const ModulePage: WizardPageDefinition = {
    id: 'module',
    title: "Modul",
    description: "Details für das zu erstellende Modul angeben.",
    fields: [
        {
            id: "moduleId",
            label: "GUID",
            type: "textbox",
            placeholder: "{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}",
            initialValue: generateGUID()
        },
        {
            id: "moduleName",
            label: "Name",
            type: "textbox",
            placeholder: "Name des Moduls",
            focus: true
        },
        {
            id: "modulDescription",
            label: "Kurzbeschreibung",
            type: "textarea",
            placeholder: "Kurze Erklärung der Funktion/Zwecks des Moduls für die README.",
            initialValue: "Diese Modul stellt verschiedene Erweiterungen bereit, um die Arbeit mit Symcon zu vereinfachen.",
            properties: {
                rows: "4",
                columns: "50"
            }
        },
        {
            id: "moduleType",
            label: "Typ",
            type: "select",
            properties: { options: ["Kern", "I/O", "Splitter", "Gerät", "Konfigurator", "Discovery"] },
            initialValue: "Gerät"
        },
        {
            id: "moduleVendor",
            label: "Hersteller",
            type: "textbox",
            placeholder: "Name des Herstellers (optional)",
        },
        {
            id: "moduleDataflow",
            label: "Datenfluss",
            type: "select",
            initialValue: "-keine-",
            optionProvider: (parameters: any) => {
                const ret: string[] = [];
                // statische Optionen
                ret.push("-keine-");
                ret.push("Client Socket");
                ret.push("HID");
                ret.push("HTTP Client");
                ret.push("HomeMatic CCU Socket");
                ret.push("Multicast Socket");
                ret.push("Remote Modul");
                ret.push("Serial Port");
                ret.push("Server Socket");
                ret.push("SSE Client");
                ret.push("UDP Socket");
                ret.push("Virtual IO");
                ret.push("WebSocket Client");
                // Dynamische Module vom Typ 1 oder 2
                const modules = getCachedModules().filter(m => m.type === 1 || m.type === 2);
                for (const m of modules) {
                    ret.push(`[Modul] ${m.name}`);
                } 
                return ret;
            }
        },
        {
            id: "modulePrefix",
            label: "Präfix",
            type: "textbox",
            placeholder: "Präfix (nur Großbuchstaben)"
        },
        {
            id: "moduleUrl",
            label: "URL",
            type: "textbox",
            placeholder: "URL zur Dokumentationnsseite des Moduls"
        },
        {
            id: "moduleAliases",
            label: "Aliase",
            type: "textbox",
            placeholder: "Komma-getrennte Liste von Aliasen (optional)"
        }
    ],
    validator: (parameters: any) => {
        console.log("Validating module with parameters:", parameters);
        const items: ValidatorResponseItem[] = [];

        // === GUID ===
        // Keine Leerzeichen oder Unterstriche am Anfang oder Ende
        const guidPattern = /^\{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}$/;
        if (!parameters.moduleId || parameters.moduleId.trim() === "") {
            items.push(createValidationItem(SEVERITY.ERROR, "moduleId", "GUID darf nicht leer sein"));
        } else if (!guidPattern.test(parameters.moduleId)) {
            items.push(createValidationItem(SEVERITY.ERROR, "moduleId", "Ungültiges GUID-Format. Erwartet: {XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}"));
        }

        // === Name ===
        // Erlaubt: Buchstaben, Zahlen, Leerzeichen, Unterstriche
        // Keine Leerzeichen oder Unterstriche am Anfang oder Ende
        const namePattern = /^(?![_\s])(?!.*[_\s]$)[A-Za-z0-9 _]+$/;
        if (!parameters.moduleName || parameters.moduleName.trim() === "") {
            items.push(createValidationItem(SEVERITY.ERROR, "moduleName", "Name darf nicht leer sein"));
        } else if (!namePattern.test(parameters.moduleName)) {
            items.push(createValidationItem(SEVERITY.ERROR, "moduleName", "Nur Buchstaben, Zahlen, Leerzeichen und Unterstriche erlaubt. Keine Leerzeichen/Unterstriche am Anfang oder Ende."));
        } else {
            // Prüfen, ob schon ein Modul mit diesem Namen existiert
            const modules = getCachedModules();
            if (modules.some(m => m.name.toLowerCase() === parameters.moduleName.toLowerCase())) {
                items.push(createValidationItem(SEVERITY.ERROR, "moduleName", `Es existiert bereits ein Modul mit dem Namen "${parameters.moduleName}".`));
            }
        }

        // === URL ===
        // Muss mit http:// oder https:// beginnen
        const urlPattern = /^https?:\/\/.+$/;
        if (!parameters.moduleUrl || parameters.moduleUrl.trim() === "") {
            items.push(createValidationItem(SEVERITY.ERROR, "moduleUrl", "URL darf nicht leer sein"));
        } else if (!urlPattern.test(parameters.moduleUrl)) {
            items.push(createValidationItem(SEVERITY.ERROR, "moduleUrl", "URL muss mit http:// oder https:// beginnen"));
        }

        // === Präfix ===
        // Nur Großbuchstaben, keine Leerzeichen
        const prefixPattern = /^[A-Z]+$/;
        if (!parameters.modulePrefix || parameters.modulePrefix.trim() === "") {
            items.push(createValidationItem(SEVERITY.ERROR, "modulePrefix", "Präfix darf nicht leer sein"));
        } else if (!prefixPattern.test(parameters.modulePrefix)) {
            items.push(createValidationItem(SEVERITY.ERROR, "modulePrefix", "Nur Großbuchstaben ohne Leerzeichen erlaubt"));
        }

        // === Aliase ===
        // Prüfen ob Aliase eingegeben wurden
        if (parameters.moduleAliases && parameters.moduleAliases.trim() !== "") {
            // Split bei Komma
            const aliases = parameters.moduleAliases.split(",").map((a: string) => a.trim());

            // Regex für erlaubte Aliase: nur A-Z, a-z, 0-9, Leerzeichen Unterstrich
            const aliasPattern = /^(?![_\s])(?!.*[_\s]$)[A-Za-z0-9 _]+$/;

            aliases.forEach((alias: string, index: number) => {
                if (alias === "") {
                    items.push(createValidationItem(
                        SEVERITY.ERROR,
                        "moduleAliases",
                        `Alias #${index + 1} ist leer`
                    ));
                } else if (!aliasPattern.test(alias)) {
                    items.push(createValidationItem(
                        SEVERITY.ERROR,
                        "moduleAliases",
                        `Alias "${alias}" enthält ungültige Zeichen (nur A-Z, a-z, 0-9, _)`
                    ));
                }
            });
        }

        return { items };
    }
};

function createValidationItem(sev: SEVERITY, id: string, content: string): ValidatorResponseItem {
    return {
        severity: sev,
        template: {
            id: id,
            content: content
        }
    };
}

interface ModuleInfo {
    id:string;
    name: string;
    folder: string;
    type: number;
    parents?: any;
    childs?: any;
    implemented?: any;
}

let cachedModules: ModuleInfo[] = [];

export function loadModulesFromWorkspace() {
    cachedModules = [];
    const folders = vscode.workspace.workspaceFolders;
    if (folders) {
        for (const folder of folders) {
            cachedModules.push(...findModules(folder.uri.fsPath));
        }
    }
    return cachedModules;
}

export function getCachedModules() {
    return cachedModules;
}

/**
 * Durchsucht rekursiv den Workspace und sammelt Module mit type 1 oder 2.
 */
export function findModules(workspaceFolder: string): ModuleInfo[] {
    const results: ModuleInfo[] = [];

    function walk(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile() && entry.name === "module.json") {
                try {
                    const raw = fs.readFileSync(fullPath, "utf-8");
                    const json = JSON.parse(raw);

                    results.push({
                        id: json.id,
                        name: json.name ?? path.basename(dir),
                        folder: dir,
                        type: json.type,
                        parents: json.parentRequirements ?? [],
                        childs: json.childRequirements ?? [],
                        implemented: json.implemented ?? []
                    });
                } catch (err) {
                    console.warn(`Fehler beim Lesen von ${fullPath}:`, err);
                }
            }
        }
    }

    if (fs.existsSync(workspaceFolder)) {
        walk(workspaceFolder);
    }
    console.log('findModules: ', results);
    return results;
}
