import * as fs from "fs/promises";
import * as path from "path";
import Handlebars from "handlebars";

export class TemplateEngine {
    private cache = new Map<string, Handlebars.TemplateDelegate>();
    private basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    async load(templateName: string): Promise<Handlebars.TemplateDelegate> {
        if (this.cache.has(templateName)) {
            return this.cache.get(templateName)!;
        }

        const filePath = path.join(this.basePath, templateName);
        const source = await fs.readFile(filePath, "utf8");

        const compiled = Handlebars.compile(source);

        this.cache.set(templateName, compiled);

        return compiled;
    }

    async render(templateName: string, data: any = {}): Promise<string> {
        const template = await this.load(templateName);
        return template(data);
    }
}