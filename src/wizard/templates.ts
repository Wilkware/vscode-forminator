import * as vscode from 'vscode';
import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as Handlebars from "handlebars";
import { getCachedModules } from './module';
import { generateGUID, getWorkspaceName } from '../util';

/**
 * Dateien/Ordner im Template-Ordner
 */
interface TemplateSpec {
    label: string;
    files: string[];
}

const templateDefinition: TemplateSpec[] = [
    {
        label: "[0]Workspace",
        files: ["vsc.code-workspace.hbs"],
    },
    {
        label: "[1] Library",
        files: ["library.json.hbs"],
    },
    {
        label: "[2] PHPUnit",
        files: ["tests"],
    },
    {
        label: "[3] PHPStan",
        files: ["phpstan.neon.hbs"],
    },
    {
        label: "[4] Readme (Bibliothek)",
        files: ["README.library.md.hbs"],
    },
    {
        label: "[5] Readme (Module)",
        files: ["README.module.md.hbs"],
    },
    {
        label: "[6] Module",
        files: ["module.php.hbs", "module.json.hbs", "form.json.hbs", "locale.json.hbs"],
    },
        {
        label: "[7] Visu",
        files: ["module.html.hbs"],
    }
];

/**
 * Alle Schritte abarbeiten um eine Library zu erstellen
 *
 * @param context: vscode.ExtensionContext
 * @param data: any
 */
export async function createLibrary(context: vscode.ExtensionContext, data: any) {
    const targetFolder: string = data.projectWorkspace;
    if (!targetFolder) {
        vscode.window.showErrorMessage("Kein Zielordner ausgewählt.");
        return false;
    }

    const config = vscode.workspace.getConfiguration("symcon");
    const userTemplatePath = config.get<string>("project.templates");
    const templateRoot =
        userTemplatePath && fs.existsSync(userTemplatePath)
            ? userTemplatePath
            : context.asAbsolutePath("resources/templates");
    console.log('Template folder: ', templateRoot);

    // --- 0. Check ob Git-Repo Ordner ---
    const gitHub = fs.existsSync(path.join(targetFolder, '.git'));

    // --- 1. Library JSON  kopieren ---
    copyTemplates(templateDefinition[1], templateRoot, targetFolder, data, ".library");

    // --- 2. Code Style auschecken ---
    const codeStyle = config.get<string>("project.codeStyle");
    if (data.projectCSFixer && codeStyle && gitHub) {
        const target = ".style";
        await runGitCommand(`git submodule add ${codeStyle} ${target}`, targetFolder);
    }

    // --- 3. Unit Test kopieren / Stubs auschecken ---
    const symconStubs = config.get<string>("project.symconStubs");
    if (data.projectUnitTests) {
        copyTemplates(templateDefinition[2], templateRoot, targetFolder, data, ".library");
        if (symconStubs && gitHub) {
            const target = "tests/stubs";
            await runGitCommand(`git submodule add ${symconStubs} ${target}`, targetFolder);
        }
    }

    // --- 4. Static Analysis kopieren / Stubs auschecken ---
    if (data.projectStaticAnalysis) {
        const target = "tests/stubs";
        if (fs.existsSync(path.join(targetFolder, target))) {
            console.log('Test exsits');
            data.projectSymconStubs = './' + target + '/';
        } else if (symconStubs && gitHub) {
            console.log('Test anlegen');
            await runGitCommand(`git submodule add ${symconStubs} ${target}`, targetFolder);
            data.projectSymconStubs = './' + target + '/';
        } else {
            console.log('Env nutzen');
            data.projectSymconStubs = '%env.IPS_STUBS_PATH%';
        }
        data.projectPHPVersion = getVersionMapping(data.libraryCompatibility);
        copyTemplates(templateDefinition[3], templateRoot, targetFolder, data, ".library");
    }

    // --- 5. README anlegen ---
    if (data.projectReadme !== 'Keine') {
        copyTemplates(templateDefinition[4], templateRoot, targetFolder, data, ".library");
    }

    // --- 6. Zusätzlich Dateien/Verzeichnisse kopieren ---
    if (userTemplatePath && fs.existsSync(userTemplatePath)) {
        const addResources = config.get<string>("project.additionalResources");
        if (addResources && addResources.trim() !== "") {
            const resources = addResources.split(",").map((a: string) => a.trim());
            for (const file of resources) {
                const src = path.join(templateRoot, file);
                const dst = path.join(targetFolder, file.replace(/\.hbs$/, ""));
                copyRecursive(src, dst, data);
            }
        }
    }
    vscode.window.showInformationMessage("Projekt erfolgreich erstellt!");

    // Workspace öffnen
    await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(targetFolder), false);
}

/**
 * Alle Schritte abarbeiten um ein Module zu erstellen
 *
 * @param context: vscode.ExtensionContext
 * @param data: any
 */
export async function createModule(context: vscode.ExtensionContext, data: any) {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
        vscode.window.showErrorMessage("Kein Zielordner ausgewählt.");
        return false;
    }
    const workspaceFolder = folders[0].uri.fsPath;
    console.log('Workspace folder: ', workspaceFolder);

    const config = vscode.workspace.getConfiguration("symcon");
    const userTemplatePath = config.get<string>("project.templates");
    const templateRoot =
        userTemplatePath && fs.existsSync(userTemplatePath)
            ? userTemplatePath
            : context.asAbsolutePath("resources/templates");
    console.log('Template folder: ', templateRoot);

    // --- 0. Modul Ordner und Daten vorbereiten ---
    data.moduleClass = data.moduleName.replace(' ', ''); // Leerzeichen entfernen
    data.moduleTypeId = getModulTypeId(data.moduleType);
    data.moduleIsStrict = data.codingClass === 'IPSModuleStrict';
    data.moduleIsKernel = data.moduleTypeId === 0;
    data.moduleIsIO = data.moduleTypeId === 1;
    data.moduleIsSplitter = data.moduleTypeId === 2;
    data.moduleIsDevice = data.moduleTypeId === 3;
    data.moduleIsConfigurator = data.moduleTypeId === 4;
    data.moduleIsDiscovery = data.moduleTypeId === 5;
    if (data.moduleTypeId == 1 || data.moduleTypeId == 2) {
        data.moduleChilds = [generateGUID()];
        data.moduleImplements = [generateGUID()];
    }
    buildModulDataFlow(data);
    if(data.moduleAliases) {
        data.moduleAliases = data.moduleAliases.split(",").map((a: string) => a.trim());
    }

    const targetFolder = path.join(workspaceFolder, data.moduleClass);
    fs.mkdirSync(targetFolder);

    console.log('DATA:', data);

    // --- 1. README anlegen und updaten ---
    if (data.codingReadme === 'Bibliothek') {
        copyTemplates(templateDefinition[5], templateRoot, workspaceFolder, data, ".module");
    } else {
        updateReadmeForModule(workspaceFolder, data.moduleClass);
        copyTemplates(templateDefinition[5], templateRoot, targetFolder, data, ".module");
    }

    // --- 2. Modul Dateien kopieren ---
    copyTemplates(templateDefinition[6], templateRoot, targetFolder, data);

    // --- 3. Visu Dateien kopieren ---
    if (data.codingVisuSupport) {
        copyTemplates(templateDefinition[7], templateRoot, targetFolder, data);
    }

    vscode.window.showInformationMessage("Modul erfolgreich erstellt!");
}

function copyTemplates(ts: TemplateSpec, from: string, to: string, data: any, replace?: string) {
    for (const file of ts.files) {
        // Quelldatei
        const src = path.join(from, file);
        // Dateiname ggf. ersetzen
        const targetName = replace ? file.replace(replace, "") : file;
        // ".hbs" am Ende entfernen
        const finalName = targetName.endsWith(".hbs") ? targetName.slice(0, -4) : targetName;
        const dst = path.join(to, finalName);
        // eigentliche Kopie/Transformation
        copyRecursive(src, dst, data);
    }
}

function copyRecursive(src: string, dst: string, data: any) {
    if (fs.lstatSync(src).isDirectory()) {
        if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
        for (const child of fs.readdirSync(src)) {
            copyRecursive(path.join(src, child), path.join(dst, child), data);
        }
    } else {
        let content = fs.readFileSync(src, "utf8");
        if (src.endsWith(".hbs")) {
            content = Handlebars.compile(content)(data);
            dst = dst.replace(/\.hbs$/, "");
        }
        fs.writeFileSync(dst, content, "utf8");
    }
}

function runGitCommand(command: string, cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        cp.exec(command, { cwd }, (err, stdout, stderr) => {
            if (err) {
                reject(new Error(stderr || stderr.toString()));
            } else {
                resolve();
            }
        });
    });
}

function getVersionMapping(symconVersion: string): number | undefined {
    const mapping: Record<string, number> = {
        "6.4": 70400, // PHP 7.4
        "7.0": 70400,
        "7.1": 70400,
        "7.2": 70400,
        "8.0": 80000, // PHP 8.0
        "8.1": 80200  // PHP 8.1
    };

    return mapping[symconVersion];
}

function getModulTypeId(moduleType: string): number {
    const mapping: Record<string, number> = {
        "Kern": 0,
        "I/O": 1,
        "Splitter": 2,
        "Gerät": 3,
        "Konfigurator": 4,
        "Discovery": 5
    };
    return mapping[moduleType] ?? 3;
}

/**
 * Prüft, ob im Verzeichnis eine Datei mit der gewünschten Endung liegt
 *
 * @param dir: string Verzeichnis
 * @param extension: string Extension
 * 
 * @return boolean TRUE wenn gefunden, andernfalls FASLE
 */
function hasFileWithExtension(dir: string, extension: string): boolean {
    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
        return false;
    }

    const files = fs.readdirSync(dir);
    return files.some(file => path.extname(file).toLowerCase() === extension.toLowerCase());
}

/**
 * Add modul readme link to main library readme
 *
 * @param workspaceRoot: string
 * @param moduleName: string
 */
function updateReadmeForModule(workspaceRoot: string, moduleName: string) {
    const readmePath = path.join(workspaceRoot, "README.md");
    const placeholder = "- __MODUL_NAME__ ([Dokumentation](MODUL_NAME))";
    const newEntry = `- ${moduleName} ([Dokumentation](${moduleName}))`;

    if (!fs.existsSync(readmePath)) {
        // README neu anlegen
        const initial = `# Bibliothek\n\nFolgende Module beinhaltet diese Bibliothek:\n\n${newEntry}\n`;
        fs.writeFileSync(readmePath, initial, "utf8");
        return;
    }

    let content = fs.readFileSync(readmePath, "utf8");
    const lines = content.split(/\r?\n/);

    // 1) Wenn Platzhalter vorhanden → ersetzen
    if (content.includes(placeholder)) {
        content = content.replace(placeholder, newEntry);
        fs.writeFileSync(readmePath, content, "utf8");
        return;
    }

    // 2) Prüfen ob Eintrag schon existiert
    if (lines.some(l => l.includes(`[Dokumentation](${moduleName})`))) {
        return; // nichts tun, schon vorhanden
    }

    // 3) letzte Zeile mit "[Dokumentation]" suchen
    let lastDocIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("[Dokumentation]")) {
            lastDocIndex = i;
        }
    }

    if (lastDocIndex >= 0) {
        // direkt danach einfügen
        lines.splice(lastDocIndex + 1, 0, newEntry);
    } else {
        // keine Dokumentationseinträge gefunden → neue Section anlegen
        lines.push("", "## Module", "", newEntry);
    }

    fs.writeFileSync(readmePath, lines.join("\n"), "utf8");
}

/**
 * buildModulDataFlow
 *
 * @param data: any
 */
function buildModulDataFlow(data: any) {
    data.moduleHasDataflow      = data.moduleDataflow !== "-keine-";
    // Trasform Dataflow
    data.dataflowIsClientSocket = data.moduleDataflow === "Client Socket";          // {3CFF0FD9-E306-41DB-9B5A-9D06D38576C3}
    data.dataflowIsHID          = data.moduleDataflow === "HID";                    // {E6D7692A-7F4C-441D-827B-64062CFE1C02}
    data.dataflowIsHTTPClient   = data.moduleDataflow === "HTTP Client";            // {4CB91589-CE01-4700-906F-26320EFCF6C4}
    data.dataflowIsCCUSocket    = data.moduleDataflow === "HomeMatic CCU Socket";   // {A151ECE9-D733-4FB9-AA15-7F7DD10C58AF}
    data.dataflowIsMulticast    = data.moduleDataflow === "Multicast Socket"        // {BAB408E0-0A0F-48C3-B14E-9FB2FA81F66A}
//  data.dataflowIsRemoteModul  = data.moduleDataflow === "Remote Modul";           // {C897D874-770B-5531-51B2-6616BEC52A8B}
    data.dataflowIsSerialPort   = data.moduleDataflow === "Serial Port";            // {6DC3D946-0D31-450F-A8C6-C42DB8D7D4F1}
    data.dataflowIsServerSocket = data.moduleDataflow === "Server Socket";          // {8062CF2B-600E-41D6-AD4B-1BA66C32D6ED}
    data.dataflowIsSSEClient    = data.moduleDataflow === "SSE Client";             // {2FADB4B7-FDAB-3C64-3E2C-068A4809849A}
    data.dataflowIsUDPSocket    = data.moduleDataflow === "UDP Socket";             // {82347F20-F541-41E1-AC5B-A636FD3AE2D8}
    data.dataflowIsVirtualIO    = data.moduleDataflow === "Virtual IO";             // {6179ED6A-FC31-413C-BB8E-1204150CF376}
    data.dataflowIsWSClient     = data.moduleDataflow === "WebSocket Client";       // {D68FD31F-0E90-7019-F16C-1949BD3079EF}

    if(data.dataflowIsClientSocket)
        data.moduleDataflowID = "{3CFF0FD9-E306-41DB-9B5A-9D06D38576C3}";
    else if(data.dataflowIsHID)
        data.moduleDataflowID = "{E6D7692A-7F4C-441D-827B-64062CFE1C02}";
    else if(data.dataflowIsHTTPClient)
        data.moduleDataflowID = "{4CB91589-CE01-4700-906F-26320EFCF6C4}";
    else if(data.dataflowIsCCUSocket)
        data.moduleDataflowID = "{A151ECE9-D733-4FB9-AA15-7F7DD10C58AF}";
    else if(data.dataflowIsMulticast)
        data.moduleDataflow   = "{BAB408E0-0A0F-48C3-B14E-9FB2FA81F66A}";
    else if(data.dataflowIsSerialPort)
        data.moduleDataflowID = "{6DC3D946-0D31-450F-A8C6-C42DB8D7D4F1}";
    else if(data.dataflowIsServerSocket)
        data.moduleDataflowID = "{8062CF2B-600E-41D6-AD4B-1BA66C32D6ED}";
    else if(data.dataflowIsSSEClient)
        data.moduleDataflow   = "{2FADB4B7-FDAB-3C64-3E2C-068A4809849A}";
    else if(data.dataflowIsUDPSocket)
        data.moduleDataflowID = "{82347F20-F541-41E1-AC5B-A636FD3AE2D8}";
    else if(data.dataflowIsVirtualIO)
        data.moduleDataflowID = "{6179ED6A-FC31-413C-BB8E-1204150CF376}";
    else if(data.dataflowIsWSClient)
        data.moduleDataflowID = "{D68FD31F-0E90-7019-F16C-1949BD3079EF}";
    
    // Initialize data flow arrays if not present
    data.moduleParents = data.moduleParents || [];
    data.moduleChilds = data.moduleChilds || [];
    data.moduleImplements = data.moduleImplements || [];

    // Switch über ParentID (Dataflow)
    switch (data.moduleDataflow) {
        // Kein Datenfluss
        case "-keine-":
            break;
        case "Client Socket":
            data.moduleParents.push("{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}");
            data.moduleImplements.push("{018EF6B5-AB94-40C6-AA53-46943E824ACF}");
            break;
        case "HID":
            data.moduleParents.push("{4A550680-80C5-4465-971E-BBF83205A02B}");
            data.moduleImplements.push("{FD7FF32C-331E-4F6B-8BA8-F73982EF5AA7}");
            break;
        case "HTTP Client":
            data.moduleParents.push("{D4C1D08F-CD3B-494B-BE18-B36EF73B8F43}");
            data.moduleImplements.push("{018EF6B5-AB94-40C6-AA53-46943E824ACF}");
            break;
        case "HomeMatic CCU Socket":
            data.moduleParents.push("{75B6B237-A7B0-46B9-BBCE-8DF0CFE6FA52}");
            data.moduleParents.push("{F4D2A45B-D513-3507-871B-36F01309D885}");
            data.moduleImplements.push("{98FEC99D-6AD9-4598-8F50-2976DA0A32C8}");
            data.moduleImplements.push("{9DF5B43F-171B-A8C2-D82E-C594FF6AF0C7}");
            break;
        case "Multicast Socket":
            data.moduleParents.push("{C8792760-65CF-4C53-B5C7-A30FCC84FEFE}");
            data.moduleParents.push("{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}");
            data.moduleImplements.push("{7A1272A4-CBDB-46EF-BFC6-DCF4A53D2FC7}");
            data.moduleImplements.push("{018EF6B5-AB94-40C6-AA53-46943E824ACF}");
            break;
        case "SSE Client":
            data.moduleParents.push("{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}");
            data.moduleImplements.push("{5A709184-B602-D394-227F-207611A33BDF}");
            break;
        case "Serial Port":
            data.moduleParents.push("{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}");
            data.moduleImplements.push("{018EF6B5-AB94-40C6-AA53-46943E824ACF}");
            break;
        case "Server Socket":
            data.moduleParents.push("{C8792760-65CF-4C53-B5C7-A30FCC84FEFE}");
            data.moduleParents.push("{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}");
            data.moduleImplements.push("{7A1272A4-CBDB-46EF-BFC6-DCF4A53D2FC7}");
            data.moduleImplements.push("{018EF6B5-AB94-40C6-AA53-46943E824ACF}");
            break;
        case "UDP Socket":
            data.moduleParents.push("{8E4D9B23-E0F2-1E05-41D8-C21EA53B8706}");
            data.moduleParents.push("{C8792760-65CF-4C53-B5C7-A30FCC84FEFE}");
            data.moduleParents.push("{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}");
            data.moduleImplements.push("{9082C662-7864-D5CA-863F-53999200D897}");
            data.moduleImplements.push("{7A1272A4-CBDB-46EF-BFC6-DCF4A53D2FC7}");
            data.moduleImplements.push("{018EF6B5-AB94-40C6-AA53-46943E824ACF}");
            break;
        case "Virtual IO":
            data.moduleParents.push("{C8792760-65CF-4C53-B5C7-A30FCC84FEFE}");
            data.moduleParents.push("{8E4D9B23-E0F2-1E05-41D8-C21EA53B8706}");
            data.moduleParents.push("{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}");
            data.moduleParents.push("{D4C1D08F-CD3B-494B-BE18-B36EF73B8F43}");
            data.moduleImplements.push("{7A1272A4-CBDB-46EF-BFC6-DCF4A53D2FC7}");
            data.moduleImplements.push("{9082C662-7864-D5CA-863F-53999200D897}");
            data.moduleImplements.push("{5A709184-B602-D394-227F-207611A33BDF}");
            data.moduleImplements.push("{018EF6B5-AB94-40C6-AA53-46943E824ACF}");
            break;
        case "WebSocket Client":
            data.moduleParents.push("{79827379-F36E-4ADA-8A95-5F8D1DC92FA9}");
            data.moduleImplements.push("{018EF6B5-AB94-40C6-AA53-46943E824ACF}");
            break;
        default:
            data.dataflowIsCustom = true;
            // Eltern-Modul im Repo suchen
            const modules = getCachedModules().filter(m => m.type === 1 || m.type === 2);
            for (const m of modules) {
                if (`[Modul] ${m.name}` === data.moduleDataflow) {
                    data.moduleDataflowID = m.id;
                    data.moduleParents.push(m.implemented[0]);
                    //data.moduleParents.push(...m.implemented);
                    data.moduleImplements.push(...m.childs);
                    break;
                }
            }
            break;
    }
}
