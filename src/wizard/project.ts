import * as vscode from 'vscode';
import { SEVERITY, ValidatorResponseItem, WizardPageDefinition } from '@redhat-developer/vscode-wizard';

// configuration
const config = vscode.workspace.getConfiguration('symcon');

// Page definitions
export const ProjectPage: WizardPageDefinition = {
    id: 'project',
    title: "Projekt",
    description: "Neuen Projekt-Ordner (workspace) für Modul-Bibliothek erstellen.<br />Erstellen Sie einen neuen leeren Ordner, oder wählen Sie einen vorbereiteten Git-Ordner aus, der als Workspace für die Modul-Bibliothek dienen soll.",
    fields: [
        {
            id: "projectWorkspace",
            label: "Workspace-Ordner:",
            initialValue: config.get<string>('general.workspace', ''),
            type: "file-picker",
            placeholder: "Workspace-Ordner auswählen",
            dialogOptions: {
                canSelectMany: false,
                canSelectFiles: false,
                canSelectFolders: true,
                defaultUri: vscode.Uri.file(config.get<string>('general.workspace', ''))
            }
        },
        {
            id: "projectTools",
            label: "Code-Qualität",
            description: "PHP Code Quality & Testing Tools",
            childFields: [
                {
                    id: "projectCSFixer",
                    label: "Unterstützung für PHP CS Fixer (Code Style) hinzuzufügen?",
                    type: "checkbox",
                    description: "Nur wenn git-Repository in Einstellungen konfiguriert ist!"
                },
                {
                    id: "projectUnitTests",
                    label: "Unterstützung für PHPUnit (Tests) hinzuzufügen?",
                    type: "checkbox",
                    description: "Standard kann durch Inhalt des Vorlagen-Ordners überschrieben werden.",
                },
                {
                    id: "projectStaticAnalysis",
                    label: "Unterstützung für PHPStan (Static Analysis) hinzuzufügen?",
                    type: "checkbox",
                    description: "Standard kann durch Inhalt des Vorlagen-Ordners überschrieben werden.",
                }
            ]
        },
        {
            id: "projectDocumentation",
            label: "Dokumentation",
            description: "Die Art und Weise wie man später Module hinzufügt, bestimmt die Struktur der Dokumentation.",
            childFields: [
                {
                    id: "projectReadme",
                    label: "README-Datei",
                    type: "radio",
                    initialValue: "Keine",
                    description: "Wähle <b>Keine</b>, wenn nur ein einzelnes Modul zum Projekt hinzugefügt wird und dessen README als Hauptdokumentation dient.<br />Wähle <b>Bibliothek</b>, wenn mehrere Module entwickelt werden sollen oder wenn eine mehrsprachige Dokumentation vorgesehen ist.",
                    properties: {
                        options: [
                            "Keine", "Bibliothek"
                        ]
                    }
                }
            ]
        }
    ],
    validator: (parameters: any) => {
        const items: ValidatorResponseItem[] = [];

        // === workspace ===
        // Hint: Nur Verzeichnisse
        const fs = require("fs");
        const workspace = parameters.projectWorkspace?.trim();

        if (!workspace || workspace.length === 0) {
            items.push(createValidationItem(SEVERITY.ERROR, "projectWorkspace", "Workspace-Ordner darf nicht leer sein"));
        } else if (!fs.existsSync(workspace)) {
            items.push(createValidationItem(SEVERITY.ERROR, "projectWorkspace", "Der angegebene Workspace-Ordner existiert nicht"));
        } else if (!fs.lstatSync(workspace).isDirectory()) {
            items.push(createValidationItem(SEVERITY.ERROR, "projectWorkspace", "Der angegebene Pfad ist kein Verzeichnis"));
        } else {
            const contents = fs.readdirSync(workspace);
            // erlaubte "leere Repo"-Dateien + *.code-workspace Dateien
            const allowed = ["readme.md", "license", ".git", ".gitignore", ".gitattributes"];
            const disallowed = contents.filter((name: string) => {
                const lower = name.toLowerCase();
                return (!allowed.includes(lower) && !lower.endsWith(".code-workspace"));
            });

            if (disallowed.length > 0) {
                console.log("Nicht erlaubte Dateien/Ordner im Workspace:", disallowed);
                items.push(createValidationItem(SEVERITY.ERROR, "projectWorkspace",
                    `Der Workspace-Ordner enthält bereits nicht erlaubte Dateien bzw. Ordner! Der Assistent erwartet maximal die Dateien: "${allowed.join(", ")}"!`));
            }
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
