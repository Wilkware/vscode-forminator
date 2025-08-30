import * as vscode from 'vscode';

export interface ThemeColors {
  bg: string;
  accent: string;
  card: string;
  content: string;
}

export function loadThemes(): Record<string, ThemeColors> {
    const config = vscode.workspace.getConfiguration('symcon');
    const themesString = config.get<string>('preview.themes') || 'light: #111C2D, #00CDAB, #FFFFFF, #000000';

    // Fallback colors
    const defaultColors: ThemeColors = {
        bg: "#111C2D",
        accent: "#00CDAB",
        card: "#FFFFFF",
        content: "#000000"
    };

    const themes: Record<string, ThemeColors> = {};

    themesString.split('\n').forEach((line, index) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return; // Kommentare oder leere Zeilen überspringen

    const [name, colors] = line.split(':').map(s => s.trim());
    if (!name || !colors) {
        console.warn(`Ungültige Zeile in themesString (Zeile ${index + 1}): ${line}`);
        return;
    }

    const [bg, accent, card, content] = colors.split(',').map(c => c?.trim());
    themes[name] = {
        bg: bg || defaultColors.bg,
        accent: accent || defaultColors.accent,
        card: card || defaultColors.card,
        content: content || defaultColors.content
    };
    });

    return themes;
}

