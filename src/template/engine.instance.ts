import * as path from "path";
import { TemplateEngine } from "./engine";

let engine: TemplateEngine | undefined;

export function initTemplateEngine(extensionPath: string) {
    engine = new TemplateEngine(
        path.join(extensionPath, "resources/templates")
    );
}

export function getTemplateEngine(): TemplateEngine {
    if (!engine) {
        throw new Error("TemplateEngine not initialized. Call initTemplateEngine() in activate().");
    }
    return engine;
}