import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import Handlebars from "handlebars";
import { getTemplateEngine } from "./template/engine.instance";

/**
 * Registers the command for creating Tile Visualization support.
 */
export function registerTileVisualization(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'createTileVisualization',
            async (uri: vscode.Uri) => {
                await createTileVisualization(context, uri);
            }
        )
    );
}

async function createTileVisualization(
    context: vscode.ExtensionContext,
    folder: vscode.Uri
): Promise<void> {

    const modulePhp = vscode.Uri.joinPath(folder, 'module.php');
    const moduleHtml = vscode.Uri.joinPath(folder, 'module.html');

    // module.php vorhanden?
    try {
        await vscode.workspace.fs.stat(modulePhp);
    } catch {
        vscode.window.showErrorMessage(vscode.l10n.t('File module.php not found!'));
        return;
    }

    // module.html darf noch nicht existieren
    try {
        await vscode.workspace.fs.stat(moduleHtml);
        vscode.window.showWarningMessage(vscode.l10n.t('File module.html already exists!'));
        return;
    } catch {
        // Datei existiert nicht -> OK
    }

    // module.php laden
    let php = await fs.readFile(modulePhp.fsPath, 'utf8');

    // Modulnamen bestimmen
    const match = php.match(/class\s+(\w+)\s+extends\s+IPSModule/);
    const moduleName = match?.[1] ?? path.basename(folder.fsPath);

    // HTML-Template laden
    const engine = getTemplateEngine();
    const block = await engine.render("module.html.hbs", {
        moduleName: moduleName
    });

    // HTML erzeugen
    await fs.writeFile(moduleHtml.fsPath, block, 'utf8');

    // PHP erweitern
    php = await patchCreateMethod(php);
    php = await patchGetVisualizationTile(php);
    php = await patchGetFullUpdateMessage(php);

    await fs.writeFile(modulePhp.fsPath, php, 'utf8');

    vscode.window.showInformationMessage(vscode.l10n.t('Tile visualization created for {0}', moduleName));
}

/**
 * patchCreateMethod
 *
 * @param php: string
 * 
 * @return string
 */
async function patchCreateMethod(php: string): Promise<string> {

    if (php.includes('SetVisualizationType(')) {
        return php;
    }

    const engine = getTemplateEngine();
    const block = await engine.render("partial.set.visu.hbs", {
        type: 1
    });

    return php.replace(
        /(function\s+Create\s*\([\s\S]*?)(\n\s*}\s*)/,
        `$1\n\n        ${block.trim()}$2`
    );
}

/**
 * patchGetVisualizationTile
 *
 * @param php: string
 * 
 * @return string
 */
async function patchGetVisualizationTile(php: string): Promise<string> {

    const engine = getTemplateEngine();
    const block = await engine.render("partial.get.visu.hbs", {});

    return insertMethodIfMissing(php,'GetVisualizationTile',`${block}`);
}

/**
 * patchGetFullUpdateMessage
 *
 * @param php: string
 * 
 * @return string
 */
async function patchGetFullUpdateMessage(php: string): Promise<string> {

    const engine = getTemplateEngine();
    const block = await engine.render("partial.upd.visu.hbs", {});

    return insertMethodIfMissing(php, 'GetFullUpdateMessage', `${block}`);
}

/**
 * Inserts a PHP method before the closing class bracket if it does not already exist.
 *
 * @param php Complete PHP source
 * @param methodName Method name without ()
 * @param methodCode Complete method including visibility
 */
function insertMethodIfMissing(
    php: string,
    methodName: string,
    methodCode: string
): string {

    const regex = new RegExp(`function\\s+${methodName}\\s*\\(`);

    if (regex.test(php)) {
        return php;
    }

    const lastBrace = php.lastIndexOf('}');

    if (lastBrace < 0) {
        return php;
    }

    return (
        php.substring(0, lastBrace) +
        '\n' +
        methodCode.trimEnd() +
        '\n' +
        php.substring(lastBrace)
    );
}