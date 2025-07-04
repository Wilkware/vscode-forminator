# Forminator — Symcon Formular Helfer / Form Helper

[![Publisher](https://img.shields.io/badge/Publisher-Wilkware-orange?style=flat-square)](https://marketplace.visualstudio.com/publishers/wilkware-vscode)
[![Version](https://img.shields.io/badge/Version-1.0.3-yellow.svg?style=flat-square)](https://github.com/Wilkware/vscode-forminator)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/wilkware-vscode.forminator?color=green&label=Installs&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=wilkware-vscode.forminator)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=flat-square)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=8816166)
[![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-green.svg?style=flat-square)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![German](https://img.shields.io/badge/Deutsch-DE-blueviolet.svg?style=flat-square)](#deutsch-de)
[![English](https://img.shields.io/badge/English-EN-blueviolet.svg?style=flat-square)](#english-en)

## Deutsch DE

### Was ist Forminator?

Forminator ist eine Visual Studio Code Extension, die das einfache Einfügen von Symcon Konfigurationsformular-Elementen (`form.json`) direkt über die Sidebar ermöglicht. Sie richtet sich an Symcon Modul Entwickler, die ihre Formulare effizienter erstellen und bearbeiten wollen.

### Hauptfunktionen

- Schnelles Einfügen von Symcon Formular-Elementen per Klick  
- Automatisches Einfügen passender JSON-Snippets mit korrekter Syntax  
- Anzeige und Bearbeitung aller Eigenschaften des ausgewählten Elements im Sidebar-Formular  
- Unterstützung aller Standard-Elementtypen aus dem Symcon PHP SDK  
- Einfaches Handling der Formulardaten ohne manuelles Tippen

### Installation

- Verfügbar im Visual Studio Marketplace  
- Alternativ: Manuelle Installation der `.vsix` Datei via `Extensions: Install from VSIX...`

### Verwendung

1. Öffne eine `forms.json` Datei im Projekt  
2. Die Forminator Sidebar wird automatisch angezeigt  

   ![Sidebar Übersicht](./media/sidebar-overview.png)  
   <!-- Screenshot: Sidebar mit Liste der Formular-Elemente -->

3. Positioniere den Cursor an die gewünschte Stelle im JSON (z.B. nach einer schließenden Klammer eines Elements)  

4. Wähle in der Sidebar ein Formular-Element aus  

   ![Formular-Eigenschaften](./media/form-settings.png)  
   <!-- Screenshot: Formular zur Eingabe der Eigenschaften -->

5. Fülle die Eigenschaften im Formular aus  

6. Klicke auf „Element einfügen“  

7. Fertig — das Element wird korrekt und formatiert im JSON eingefügt  

   ![Eingefügtes Element](./media/inserted-element.png)  
   <!-- Screenshot: Beispiel JSON nach dem Einfügen -->

### Zielgruppe

Diese Extension richtet sich an Entwickler von Symcon Modulen, die das PHP SDK nutzen.

---

## English EN

### What is Forminator?

Forminator is a Visual Studio Code extension for easily inserting Symcon configuration form elements (`form.json`) directly from the sidebar. It is designed for Symcon module developers who want to build and edit their forms more efficiently.

### Main Features

- Quick insertion of Symcon form elements with a click  
- Automatic insertion of proper JSON snippets with correct syntax  
- Sidebar form to display and edit all properties of the selected element  
- Support for many standard element types from the Symcon PHP SDK  
- Easy handling of form data without manual typing

### Installation

- Available on the Visual Studio Marketplace  
- Alternatively, install manually from the `.vsix` file using `Extensions: Install from VSIX...`

### Usage

1. Open a `forms.json` file in your project  
2. The Forminator sidebar appears automatically  

   ![Sidebar Overview](./media/sidebar-overview.png)  
   <!-- Screenshot: Sidebar with list of form elements -->

3. Place the cursor where you want to insert a new element (e.g., after a closing brace of the previous element)  

4. Select a form element in the sidebar  

   ![Form Properties](./media/form-properties.png)  
   <!-- Screenshot: Form for entering element properties -->

5. Fill out the properties in the form  

6. Click the "Insert Element" button  

7. Done — the element is inserted correctly formatted in the JSON  

   ![Inserted Element](./media/inserted-element.png)  
   <!-- Screenshot: Example JSON after insertion -->

### Target Audience

This extension is targeted at developers of Symcon modules using the PHP SDK.

---

## Feedback & Contributions

Contributions and feedback are very welcome! Feel free to open issues or pull requests on the [GitHub repository](https://github.com/Wilkware/vscode-forminator).

---

## License

CC BY--NC--SA 4.0 © Wilkware
