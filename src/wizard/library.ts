import * as vscode from 'vscode';
import { SEVERITY, ValidatorResponseItem, WizardPageDefinition } from '@redhat-developer/vscode-wizard';
import { generateGUID, generatetTimestamp, generateBuildInfo } from '../util';

// configuration
const config = vscode.workspace.getConfiguration('symcon');

// Page definitions
export const LibraryPage: WizardPageDefinition = {
    id: 'library',
    title: "Bibliothek",
    description: "Allgemeine Informationen zur Modul-Bibliothek",
    fields: [
        {
            id: "libraryId",
            label: "GUID",
            type: "textbox",
            placeholder: "{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}",
            initialValue: generateGUID()
        },
        {
            id: "libraryName",
            label: "Name",
            type: "textbox",
            placeholder: "Name der Modulbibliothek",
            focus: true
        },
        {
            id: "libraryDescription",
            label: "Kurzbeschreibung",
            type: "textarea",
            placeholder: "Kurze Erklärung der Funktion/Zwecks der Bibliothek für die README.",
            initialValue: "Diese Modulbibliothek stellt verschiedene Erweiterungen bereit, um die Arbeit mit Symcon zu vereinfachen.",
            properties: {
                rows: "4",
                columns: "50"
            }
        },
        {
            id: "libraryAuthor",
            label: "Autor",
            type: "textbox",
            placeholder: "Name des Entwicklers / Name der Firma",
            initialValue: config.get<string>('general.author', '')
        },
        {
            id: "libraryUrl",
            label: "Homepage",
            type: "textbox",
            placeholder: "URL zur Homepage",
            initialValue: config.get<string>('general.homepage', '')
        },
        {
            id: "libraryCompatibility",
            label: "Kompatibilität",
            type: "select",
            properties: { options: ["6.4", "7.0", "7.1", "7.2", "8.0", "8.1", "8.2"] },
            initialValue: "8.1"
        },
        {
            id: "libraryVersion",
            label: "Version",
            type: "textbox",
            placeholder: "Versionsnummer",
            initialValue: config.get<string>('general.version', '1.0')
        },
        {
            id: "libraryBuild",
            label: "Build",
            type: "number",
            placeholder: "Buildnummer",
            initialValue: generateBuildInfo(config.get<string>('general.build', '1'), new Date(), config.get<string>('general.version', '1.0'))
        },
        {
            id: "libraryDate",
            label: "Datum",
            type: "number",
            placeholder: "Unix-Zeitstempel",
            initialValue: generatetTimestamp().toString()
        }
    ],
    validator: (parameters: any) => {
        const items: ValidatorResponseItem[] = [];

        // === guid ===
        // Keine Leerzeichen oder Unterstriche am Anfang oder Ende
        const guidPattern = /^\{[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}\}$/;
        if (!parameters.libraryId || parameters.libraryId.trim() === "") {
            items.push(createValidationItem(SEVERITY.ERROR, "libraryId", "GUID darf nicht leer sein"));
        } else if (!guidPattern.test(parameters.libraryId)) {
            items.push(createValidationItem(SEVERITY.ERROR, "libraryId", "Ungültiges GUID-Format. Erwartet: {XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}"));
        }

        // === Name ===
        // Erlaubt: Buchstaben, Zahlen, Leerzeichen, Unterstriche
        // Keine Leerzeichen oder Unterstriche am Anfang oder Ende
        const namePattern = /^(?![_\s])(?!.*[_\s]$)[A-Za-z0-9 _]+$/;
        if (!parameters.libraryName || parameters.libraryName.trim() === "") {
            items.push(createValidationItem(SEVERITY.ERROR, "libraryName", "Name darf nicht leer sein"));
        } else if (!namePattern.test(parameters.libraryName)) {
            items.push(createValidationItem(SEVERITY.ERROR, "libraryName", "Nur Buchstaben, Zahlen, Leerzeichen und Unterstriche erlaubt. Keine Leerzeichen/Unterstriche am Anfang oder Ende."));
        }

        // === URL ===
        // Muss mit http:// oder https:// beginnen
        const urlPattern = /^https?:\/\/.+$/;
        if (!parameters.libraryUrl || parameters.libraryUrl.trim() === "") {
            items.push(createValidationItem(SEVERITY.ERROR, "libraryUrl", "Homepage darf nicht leer sein"));
        } else if (!urlPattern.test(parameters.libraryUrl)) {
            items.push(createValidationItem(SEVERITY.ERROR, "libraryUrl", "Homepage muss mit http:// oder https:// beginnen"));
        }

        // === Version ===
        // Muss x.y Format haben (z.B. 1.0, 2.3)
        const versionPattern = /^\d+\.\d+$/;
        if (!parameters.libraryVersion) {
            items.push(createValidationItem(SEVERITY.ERROR, "libraryVersion", "Version darf nicht leer sein"));
        } else if (!versionPattern.test(parameters.libraryVersion)) {
            items.push(createValidationItem(SEVERITY.ERROR, "libraryVersion", "Version muss im Format x.y angegeben werden (z.B. 1.0, 2.3)"));
        }

        // === Date ===
        const datePattern = /^\d+$/;
        if (!parameters.libraryDate) {
            items.push(createValidationItem(SEVERITY.ERROR, "libraryDate", "Datum darf nicht leer sein"));
        } else if (!datePattern.test(parameters.libraryDate)) {
            items.push(createValidationItem(SEVERITY.ERROR, "libraryDate", "Datum muss ein gültiger Unix-Zeitstempel sein"));
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
