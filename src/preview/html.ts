import * as vscode from 'vscode';
import { loadThemes } from './themes';

/**
 * getWorkspaceName - Name of the first (and only) workspace folder
 *
 * @return string
 */
export function getWorkspaceName(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].name;
  }
  return undefined;
}

 /**
  * getBaseTag - Full blown base tag
  *
  * @return string
  */
export function getBaseTag(): string {
    const config = vscode.workspace.getConfiguration('forminator');
    const ip = config.get<string>('serverIP', '127.0.0.1');
    const port = config.get<string>('serverPort', '3777');

    return `http://${ip}:${port}`;
}

/**
 * getThemeSelectHTML
 *
 * @param label: string
 * @param id: string
 * @param selected?: string
 * 
 * @return string
 */
export function getThemeSelectHTML(label: string, id: string, selected?: string): string {
  const themes = loadThemes();

  const options = Object.keys(themes)
    .map(key => {
      const isSelected = key === selected ? ' selected' : '';
      return `<option value="${escapeHtml(key)}"${isSelected}>${key}</option>`;
    })
    .join('\n');

  return `
    <label for="${id}">${label}:</label>
    <select id="${id}" name="${id}">
      ${options}
    </select>
  `;
}

/**
 * getSizeSelectHTML
 *
 * @param label: string
 * @param id: string
 * @param selected: number
 * 
 * @return string
 */
export function getSizeSelectHTML(label: string, id: string, selected: number = 118): string {
  const options: string[] = [];
  const startPx = 118;
  const stepPx = 42;

  for (let unit = 3; unit <= 12; unit++) {
    const px = startPx + (unit - 3) * stepPx;
    const isSelected = px === selected ? ' selected' : '';
    options.push(`<option value="${px}"${isSelected}>${unit}</option>`); // Value = px, Text = unit
  }

  return `
    <label for="${id}">${label} (3-12):</label>
    <select id="${id}" name="${id}">
      ${options.join('\n')}
    </select>
  `;
}

 /**
  * getButtonHTML
  *
  * @param label: string
  * @param id: string
  * @param type: string
  * 
  * @return string
  */
export function getButtonHTML(label: string, id: string, type: string = 'Button'): string {

  return `<button id="${id}" type="${type}">${label}</button>`;
}


 /**
  * rewriteResources
  *
  * @param html: string
  * @param base: string
  */
export function rewriteResources(html: string, base: string) {
    return html
        .replace(/\s(src|href)\s*=\s*"(?!https?:|data:|vscode-)([^"]+)"/gi, (_m, attr, url) => ` ${attr}="${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}"`)
        .replace(/url\(\s*"(?!https?:|data:|vscode-)([^"]+)"\s*\)/gi, (_m, url) => `url("${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}")`);
}

 /**
  * getNonce
  *
  */
export function getNonce() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 32 }, () => possible[Math.floor(Math.random() * possible.length)]).join('');
}

 /**
  * escapeHtml
  *
  * @param text: string
  * 
  * @return string
  */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}