import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as html from './preview/html';
import { loadThemes,loadTitles } from './preview/themes';
import { getWorkspaceName} from './util';

/**
 * registerPreviewPanel - Registers the command for RegisterProperty functions in Create.
 *
 * @param context: vscode.ExtensionContext
 */
export function registerPreviewPanel(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('openPreviewVisualisation', () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage(vscode.l10n.t('No active editor.'));
                return;
            }

            const file = activeEditor.document.fileName;
            if (!file.endsWith('module.html')) {
                vscode.window.showWarningMessage(vscode.l10n.t('Please open the module HTML file (module.html) before running this command.'));
                return;
            }

            PreviewPanel.createOrShow(context, file);
        })
    );
}

const DEFAULT_VALUES = {
    theme:  'light',
    title:  'Big',
    grid:   12,
    width:  6,
    height: 6
}

const STATE_KEYS = {
    previewSettings: 'previewSettings',
    previewPayload: (module: string) => `previewPayload:${module}`
}


/**
 * Interfcae UpdateFrameOptions
 */
interface UpdateFrameOptions {
  themeKey?: string;
  titleSize?: string;
  moduleFile?: string;
  docText?: string;
}

/**
 * Interface PreviewSettings
 */
interface PreviewSettings {
    theme: string;
    title: string;
    grid: number;
    width: number;
    height: number;
}

/**
 * class PreviewPanel
 */
class PreviewPanel {
    static current: PreviewPanel | undefined;
    private editorListener?: vscode.Disposable;
    private disposed = false;

    private constructor(
        private readonly ctx: vscode.ExtensionContext,
        private readonly panel: vscode.WebviewPanel,
        private readonly module: string
    ) {
        this.module = module;
        this.panel.onDidDispose(() => {
            this.disposed = true;
            PreviewPanel.current = undefined;
        });
        this.postMessageHandlers();
        this.editorChangeListener();
        this.updateHtml();
    }

    static createOrShow(ctx: vscode.ExtensionContext, module: string) {
        const column = vscode.ViewColumn.Two;
        if (this.current) {
            this.current.panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel(
            'forminatorPreview',
            vscode.l10n.t('Preview Tile Visualisation'),
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(ctx.extensionUri, 'resources'),
                    ...(vscode.workspace.workspaceFolders ?? []).map(f => f.uri),
                ],
            }
        );
        this.current = new PreviewPanel(ctx, panel, module);
    }

    private async updateHtml() {
        const webview = this.panel.webview;
        const nonce = html.getNonce();

        const previewCssUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.ctx.extensionUri, 'resources', 'preview.css')
        );

        const elementsCssUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.ctx.extensionUri, 'resources', 'elements-lite.css')
        );

        // Card title
        const title = getWorkspaceName() ?? 'Title/Titel';

        // Load actual editor content
        const editor = vscode.window.activeTextEditor;
        let moduleHtml = '';
        let localeJson = '';

        if (editor) {
            const moduleUri = editor.document.uri;

            // module.html (aktueller Editor)
            moduleHtml = editor.document.getText();
            /*
            if (editor && editor.document.fileName === this.module) {
                moduleHtml = editor.document.getText();
            }
            */
           
            // Pfad zur locale.json im selben Ordner
            const localeUri = vscode.Uri.file(
                path.join(path.dirname(moduleUri.fsPath), 'locale.json')
            );

            // Datei lesen
            const localeBytes = await vscode.workspace.fs.readFile(localeUri);
            const localeText = Buffer.from(localeBytes).toString('utf8');
            localeJson = JSON.parse(localeText);
        }

        // Theme config data
        const themes = loadThemes();
        console.log('Themes: ', themes);
        const titles = loadTitles();
        console.log('Titles: ', titles);

        // Preview settings
        const preview = await this.loadPreview();
        console.log('Preview: ', preview);

        // Base tag
        const baseTag = html.getBaseTag();

        // moduleHtml = rewriteResources(moduleHtml, baseTag);
        moduleHtml = moduleHtml.replace(/<head([^>]*)>/i,`<head$1>
<base href="${baseTag}/">
<script src='html-sdk.js'></script>
<script>
    var locale = ${JSON.stringify(localeJson)};
  (function(){
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.appendChild(document.createTextNode(\`
        :root {
            --accent-color: ${themes[preview.theme]['accent']};
            --card-color: ${themes[preview.theme]['card']};
            --content-color: ${themes[preview.theme]['content']};
            --margin-top: ${titles[preview.title]}px;
            --margin-side: 20px;
            --margin-bottom: 15px;
        }
        body {
            font-size: 14px;
            margin-top: ${titles[preview.title]}px;
            margin-left: 20px;
            margin-right: 20px;
            margin-bottom: 15px;
        }
    \`));
  })();
</script>`
);
        // In Data-URI umwandeln
        const frameSource = 'data:text/html;charset=utf-8,' + encodeURIComponent(moduleHtml);

        // HTML des WebViews setzen
        this.panel.webview.html = `
<!doctype html>
<html lang="de">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
            img-src ${webview.cspSource} ${baseTag} data:;
            style-src ${webview.cspSource} 'unsafe-inline';
            script-src 'unsafe-inline' ${baseTag} ${webview.cspSource};
            font-src ${webview.cspSource} ${baseTag};
            media-src ${webview.cspSource} ${baseTag};
            connect-src ${webview.cspSource};
            frame-src 'self' data:;">
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="stylesheet" href="${previewCssUri}">
    <link rel="stylesheet" href="${elementsCssUri}" />

    <title>Symcon TileVisu Preview</title>
</head>
<body>

    <div class="config-panel">
        ${html.getThemeSelectHTML(vscode.l10n.t('THEME'), 'theme', preview.theme)}
        ${html.getSizeSelectHTML(vscode.l10n.t('GRID'), 'grid', 24, preview.grid)}
    </div>
    <div class="config-panel">
        ${html.getTitleSelectHTML(vscode.l10n.t('TITLE'), 'title', preview.title)}
        ${html.getSizeSelectHTML(vscode.l10n.t('HEIGHT'), 'height', preview.grid, preview.height)}
        ${html.getSizeSelectHTML(vscode.l10n.t('WIDTH'), 'width', preview.grid, preview.width)}
    </div>

    <div id="tile" class="card">
        <div id="header">${title}</div>
        <div id="expand" title="${vscode.l10n.t('Enlarge tile')}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="12px" height="12px" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <!-- Pfeil nach rechts oben -->
                <line x1="14" y1="10" x2="20" y2="4" />
                <polyline points="14,4 20,4 20,10" />
                <!-- Pfeil nach links unten -->
                <line x1="10" y1="14" x2="4" y2="20" />
                <polyline points="4,14 4,20 10,20" />
            </svg>
        </div>
        <div class="frame">
            <iframe id="preview" sandbox="allow-scripts" src="${frameSource}" style="width:100%;height:100%;border:none;"></iframe>
        </div>
    </div>

    <div id="json" class="edit">
        <pre id="code" contenteditable="true"></pre>
        ${html.getButtonHTML(vscode.l10n.t('SAVE'), 'save')}
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const THEMES = ${JSON.stringify(themes)};
        const TITLES = ${JSON.stringify(titles)};
        const root = document.documentElement;

        const iframe = document.getElementById('preview');
        const code = document.getElementById('code');

        let currentTheme = '${preview.theme}';
        let currentTitle = '${preview.title}';
        root.style.setProperty('--bg-color', THEMES[currentTheme].bg);
        root.style.setProperty('--accent-color', THEMES[currentTheme].accent);
        root.style.setProperty('--text-color', THEMES[currentTheme].content);
        root.style.setProperty('--card-color', THEMES[currentTheme].card);

        window.addEventListener('DOMContentLoaded', ()=>{
            document.getElementById('expand')?.addEventListener('click', () => {
                showMessage('${vscode.l10n.t('Just a dummy ;-)')}');
            });
            document.getElementById('save')?.addEventListener('click', ()=>{
                vscode.postMessage({cmd:'save', data:document.getElementById('code').textContent||''});
            });
            // Selects
            document.getElementById('theme')?.addEventListener('change', ()=> {
                updateCard();
            });
            document.getElementById('title')?.addEventListener('change', ()=> {
                updateCard();
            });
            // Slides
            document.getElementById('grid-range').addEventListener('input', e => {
                gridSize = parseInt(e.target.value);
                document.getElementById('grid-value').textContent = gridSize;
                updateCard();
            });
            document.getElementById('width-range').addEventListener('input', e => {
                widthSize = parseInt(e.target.value);
                document.getElementById('width-value').textContent = widthSize;
                updateCard();
            });
            document.getElementById('height-range').addEventListener('input', e => {
                heightSize = parseInt(e.target.value);
                document.getElementById('height-value').textContent = heightSize;
                updateCard();
            });

            // loadready-Event to extension
            vscode.postMessage({ cmd: 'load' });

            // Initial update card
            updateCard();
        });

        window.addEventListener('message', ev=>{
            const msg=ev.data;
            console.log('msg', msg);
            if(msg.cmd==='init'){
                if (code) code.textContent = JSON.stringify(msg.payload ?? {}, null, 4);
                try {
                    const updatedData = JSON.parse(code.textContent);
                    iframe.contentWindow?.postMessage(JSON.stringify(updatedData), '*');
                } catch (e) {
                    console.error('Invalid JSON:', e.message);
                }
            }
            if (msg.cmd === 'edit') {
                const iframe = document.getElementById('preview');
                if (iframe) {
                    iframe.src = msg.source;
                    iframe.onload = () => {
                        try {
                            const payload = JSON.parse(code?.textContent || '{}');
                            iframe.contentWindow?.postMessage(JSON.stringify(payload), '*');
                        } catch (e) {
                            console.warn('Invalid JSON in editor, sending empty object');
                            iframe.contentWindow?.postMessage({}, '*');
                        }
                    };
                }   
            }
            if (msg.cmd === 'status') {
                showMessage(msg.text);
            }
        });

        // Forward changes directly to the iframe
        code.addEventListener('input', () => {
            try {
                const updatedData = JSON.parse(code.textContent);
                iframe.contentWindow?.postMessage(JSON.stringify(updatedData), '*');
            } catch (e) {
                console.error('Invalid JSON:', e.message);
            }
        });

        function updateCard() {
            const BASE_WIDTH = 1000;

            const root = document.documentElement;
            const theme = document.getElementById('theme')?.value || ${DEFAULT_VALUES.theme};
            const title = document.getElementById('title')?.value || ${DEFAULT_VALUES.title};

            const grid = parseInt(document.getElementById('grid-range')?.value || '${DEFAULT_VALUES.grid}', 10); 
            const gridUnit = BASE_WIDTH / grid;

            const widthSlider = document.getElementById('width-range');
            const heightSlider = document.getElementById('height-range');

            // Max Werte setzen
            widthSlider.max = grid;
            heightSlider.max = grid;

            // Slider Werte lesen
            let width = parseInt(widthSlider.value || '${DEFAULT_VALUES.width}', 10); 
            let height = parseInt(heightSlider.value || '${DEFAULT_VALUES.height}', 10);

            // Clamp Werte
            width = Math.max(1, Math.min(width, grid));
            height = Math.max(1, Math.min(height, grid));

            // Slider korrigieren falls nötig
            widthSlider.value = width;
            heightSlider.value = height;
            // und Valueanzeige korrigieren falls nötig
            const widthValue = document.getElementById('width-value');
            const heightValue = document.getElementById('height-value');
            widthValue.textContent = width;
            heightValue.textContent = height;

            // Pixel berechnen
            const widthUnit = width * gridUnit;
            const heightUnit = height * gridUnit;

            console.log('Update card with', {
                theme, title,
                grid, gridUnit,
                width, widthUnit,
                height, heightUnit
            });

            root.style.setProperty('--card-width', widthUnit + 'px');
            root.style.setProperty('--card-height', heightUnit + 'px');

            const changedTheme = currentTheme !== theme;
            const changedTitle = currentTitle !== title;
            const changed = changedTheme || changedTitle;

            vscode.postMessage({
                    cmd:'preview', 
                    changed: changed,
                    theme: theme,
                    title: title,
                    grid: grid,
                    width: width,
                    height: height
            });

            if (changedTheme) {
                const entry = THEMES[theme];
                if (!entry) return;

                root.style.setProperty('--bg-color', entry.bg);
                root.style.setProperty('--accent-color', entry.accent);
                root.style.setProperty('--card-color', entry.card);
                root.style.setProperty('--text-color', entry.content);

                currentTheme = theme;
            }
            if (changedTitle) {
                currentTitle = title;
            }
        }

        function showMessage(msg) {
            const div = document.createElement('div');
            div.textContent = msg;
            div.style.position = 'fixed';
            div.style.top = '10px';
            div.style.right = '10px';
            div.style.background = 'rgba(253, 0, 0, 0.7)';
            div.style.color = 'white';
            div.style.padding = '10px 20px';
            div.style.borderRadius = '5px';
            div.style.zIndex = '10000';
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 2000);
        }
    </script>
</body>
</html>`;
    }

    dispose() {
        this.editorListener?.dispose();
        this.panel.dispose();
    }

    private editorChangeListener() {
        this.editorListener = vscode.workspace.onDidChangeTextDocument((e) => {
            // Check whether the modified document is the module currently displayed.
            if (e.document.fileName === this.module) {
                this.updateFrame({ docText: e.document.getText() });
            }
        });
    }

    private postMessageHandlers() {
        this.panel.webview.onDidReceiveMessage(async (msg) => {
            switch (msg.cmd) {
                case 'load': 
                    await this.loadPayload(); 
                    break;
                case 'save': 
                    await this.savePreload(msg.data); 
                    break;
                case 'preview': 
                    await this.savePreview({ theme: msg.theme, title: msg.title, grid: msg.grid, width: msg.width, height: msg.height });
                    if (msg.changed) {
                        await this.updateFrame({ themeKey: msg.theme, titleSize: msg.title });
                    }
                    break;
            }
        });
    }

    private async updateFrame(options: UpdateFrameOptions) {
        if (this.disposed) return;

        const webview = this.panel.webview;

        // Base tag
        const baseTag = html.getBaseTag();

        // Theme
        const themes = loadThemes();
        const theme = options.themeKey || (await this.loadPreview()).theme;
        const titles = loadTitles();
        const title = options.titleSize || (await this.loadPreview()).title;
        // HTML laden
        let moduleHtml: string;
        if (options.docText) {
            moduleHtml = options.docText;           // Text vom Editor
        } else {
            const file = options.moduleFile || this.module;
            moduleHtml = await fs.readFile(file, 'utf8');
        }
        // Translation laden
        let localeJson = { translations: {} };

        try {
            const moduleDir = path.dirname(options.moduleFile || this.module);
            const localePath = path.join(moduleDir, 'locale.json');

            const localeText = await fs.readFile(localePath, 'utf8');
            localeJson = JSON.parse(localeText);
        } catch (err) {
            // fallback: keine locale.json vorhanden
        }

        // Patch <head>
        moduleHtml = moduleHtml.replace(
            /<head([^>]*)>/i,
            `<head$1>
    <base href="${baseTag}/">
    <script src='html-sdk.js'></script>
    <script>
    var locale = ${JSON.stringify(localeJson)};
    (function(){
        const style = document.createElement('style');
        document.head.appendChild(style);
        style.appendChild(document.createTextNode(\`
        :root {
            --accent-color: ${themes[theme]['accent']};
            --card-color: ${themes[theme]['card']};
            --content-color: ${themes[theme]['content']};
            --margin-top: ${titles[title]}px;
            --margin-side: 20px;
            --margin-bottom: 15px;
        }
        body {
            font-size: 14px;
            margin-top: ${titles[title]}px;
            margin-left: 20px;
            margin-right: 20px;
            margin-bottom: 15px;
        }
        \`));
    })();
    </script>`
        );

        const frameSource = 'data:text/html;charset=utf-8,' + encodeURIComponent(moduleHtml);

        webview.postMessage({
            cmd: 'edit',
            source: frameSource
        });
    }
    
    private async loadPayload() {
        // KEY unique by module
        const key = STATE_KEYS.previewPayload(this.module);
        const payload = this.ctx.workspaceState.get(key, { status: 'online' });
        // send directly to Webview
        if (!this.disposed) {
            this.panel.webview.postMessage({ cmd: 'init', payload });
        }
    }

    private async savePreload(data: any) {
        try {
            // Validate JSON
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            // KEY unique by module
            const key = STATE_KEYS.previewPayload(this.module);
            await this.ctx.workspaceState.update(key, parsed);
            if (!this.disposed) {
                this.panel.webview.postMessage({ cmd: 'status', text: vscode.l10n.t('💾 Saved.') });
            }
        } catch (e: any) {
            if (!this.disposed) {
                this.panel.webview.postMessage({ cmd: 'status', text: vscode.l10n.t('❌ Save failed: ') + e.message });
            }
        }
    }

    private async loadPreview(): Promise<PreviewSettings> {
        const defaults: PreviewSettings = { theme: DEFAULT_VALUES.theme, title: DEFAULT_VALUES.title, grid: DEFAULT_VALUES.grid, width: DEFAULT_VALUES.width, height: DEFAULT_VALUES.height };
        const stored = this.ctx.workspaceState.get<PreviewSettings>(STATE_KEYS.previewSettings);
        return { theme: DEFAULT_VALUES.theme, title: DEFAULT_VALUES.title, grid: DEFAULT_VALUES.grid, width: DEFAULT_VALUES.width, height: DEFAULT_VALUES.height, ...stored }; // fallback to defaults
    }

    private async savePreview(settings: Partial<PreviewSettings>) {
        const current = this.ctx.workspaceState.get<Partial<PreviewSettings>>(STATE_KEYS.previewSettings) ?? {};
        const updated = { ...current } as Partial<PreviewSettings>;

        if (settings.theme !== undefined && settings.theme !== '') {
            updated.theme = settings.theme;
        }
        if (settings.title !== undefined && settings.title !== '') {
            updated.title = settings.title;
        }
        if (settings.grid !== undefined && !isNaN(settings.grid) && settings.grid >= 1 && settings.grid <= 24) {
            updated.grid = settings.grid;
        }
        if (settings.width !== undefined) updated.width = settings.width;
        if (settings.height !== undefined) updated.height = settings.height;

        await this.ctx.workspaceState.update(STATE_KEYS.previewSettings, updated);
        console.log('Preview settings saved:', updated);
    }
}
