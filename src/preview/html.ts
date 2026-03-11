import * as vscode from 'vscode';
import { loadThemes, loadTitles } from './themes';

 /**
  * getBaseTag - Full blown base tag
  *
  * @return string
  */
export function getBaseTag(): string {
    const config = vscode.workspace.getConfiguration('symcon');
    const ip = config.get<string>('preview.serverIP', '127.0.0.1');
    const port = config.get<string>('preview.serverPort', '3777');
    console.log('serverIP: ' + ip);
    console.log('serverPort: ' + port);

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
    <label>${label}:
        <div class="vscode-select" style="width: 100px;">
            <select id="${id}" name="${id}">
                ${options}
            </select>
            <span class="chevron-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z" />
                </svg>
            </span>
        </div>
    </label>
  `;
}

export function getTitleSelectHTML(label: string, id: string, selected?: string): string {
  const titles = loadTitles();
  console.log('Titles HTML: ', titles);

  const options = Object.keys(titles)
    .map(key => {
      const isSelected = key === selected ? ' selected' : '';
      return `<option value="${escapeHtml(key)}"${isSelected}>${vscode.l10n.t(key)}</option>`;
    })
    .join('\n');

  return `
    <label>${label}:
        <div class="vscode-select" style="width: 100px;">
            <select id="${id}" name="${id}">
                ${options}
            </select>
            <span class="chevron-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z" />
                </svg>
            </span>
        </div>
    </label>
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
export function getSizeSelectHTML(label: string, id: string, max: number = 24, selected: number = 12): string {

  return `
    <label>${label}:
        <div class="vscode-slider">
            <input type="range" id="${id}-range" min="1" max="${max}" step="1" value="${selected}" />
            <span class="vscode-slider-value" id="${id}-value">${selected}</span>
        </div>
    </label>
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