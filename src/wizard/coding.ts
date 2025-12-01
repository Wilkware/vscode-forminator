import * as vscode from 'vscode';
import { SEVERITY, ValidatorResponseItem, WizardPageDefinition } from '@redhat-developer/vscode-wizard';

// configuration
const config = vscode.workspace.getConfiguration('symcon');

// Page definitions
export const CodingPage: WizardPageDefinition = {
    id: 'coding',
    title: "Programmierung",
    description: "Stellt Einstellungen für Aufbau, Verhalten und Integration des Moduls bereit.",
    fields: [
        {
            id: "codingClass",
            label: "Basisklasse:",
            type: "select",
            properties: { options: ["IPSModule", "IPSModuleStrict"] },
            initialValue: "IPSModule"
        },
        {
            id: "codingMethods",
            label: "Methoden",
            description: "Auswahl an zusätzlichen vodefinierten Methoden.",
            childFields: [
                {
                    id: "codingConfigForm",
                    label: "<i>GetConfigurationForm</i> hinzufügen",
                    type: "checkbox",
                    description: "Hilfreich wenn man die Elemente der Modulkonfiguration manipulieren möchte"
                },
                {
                    id: "codingMessageSink",
                    label: "<i>MessageSink</i> hinzufügen",
                    type: "checkbox",
                    description: "Hilfreich wenn man auf Wert-Änderungen von ausgewählten Variablen reagieren möchte",
                },
                {
                    id: "codingRequestAction",
                    label: "<i>RequestAction</i> hinzufügen",
                    type: "checkbox",
                    description: "Hilfreich wenn man auf ausgewählte Aktionen reagieren möchte",
                },
                {
                    id: "codingEchoMessage",
                    label: "<i>EchoMessage</i> hinzufügen",
                    type: "checkbox",
                    description: "Hilfreich um Nachrichten während der Konfiguration im Modul zu zeigen. Setzt entsprechendes Popup-Element in der form.json vorraus.",
                }
            ]
        },
        {
            id: "codingVisu",
            label: "Visualisierung",
            description: "Aktiviert die Integration der neuen Kachel-Visualisierung.",
            childFields: [
                {
                    id: "codingVisuSupport",
                    label: "Generelle Unterstützung für die neue Kachel-Visualisierung?",
                    type: "checkbox",
                    description: "Setzt entsprechende Version von Symcon ab 7.0, besser 8.1 vorraus!"
                },
                {
                    id: "codingVisuColor",
                    label: "Unterstützung für Behandlung von Farbwerten hinzuzufügen?",
                    type: "checkbox",
                    description: "Fügt entsprechende Funktionen für Austausch von HTML-Farbwerten hinzu.",
                },
                {
                    id: "codingVisuMedia",
                    label: "Unterstützung für Medien (Bilder) hinzuzufügen?",
                    type: "checkbox",
                    description: "Fügt entsprechende Funktionen zum Kodieren von Medieninhalten hinzu.",
                }
            ]
        },
        {
            id: "codingDocumentation",
            label: "Dokumentation",
            description: "Soll die Modulbeschreibung als Hauptdokumentation oder als Teil der gesamten Dokumentation dienen.",
            childFields: [
                {
                    id: "codingReadme",
                    label: "README-Datei",
                    type: "radio",
                    initialValue: "Modul",
                    description: "Wähle <b>Modul</b>, wenn die Moduledokumentation in die Haupt-README integriert werden soll (verlinkt).<br />Wähle <b>Bibliothek</b>, wenn es nur dieses Modul im Projekt geben wird und dessen README als Hauptdokumentation dienen soll.",
                    properties: {
                        options: [
                            "Modul", "Bibliothek"
                        ]
                    }
                }
            ]
        }
    ],
    validator: (parameters: any) => {
        const items: ValidatorResponseItem[] = [];

        return { items };
    }
};
