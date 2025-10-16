import fs from "fs";
//import path from "path";

export interface SVIFile {
    destinationFile?: string;
    inputParameters?: string[];
    output?: string[];
    options?: Record<string, string | boolean>;
    importPrompts?: string[];
    prompt?: string;
}

/**
 * Parses a `.svi` file into structured sections.
 * Supports single-line (`//`) and multi-line (`/* ... *\/`) comments.
 */
export class SVIParser {
    /**
     * Reads and parses a .svi file.
     * @param filePath Full path to the .svi file.
     */
    public parseFile(filePath: string): SVIFile {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const raw = fs.readFileSync(filePath, "utf-8");
        return this.parseContent(raw, filePath);
    }

    /**
     * Parses the raw content of a .svi file.
     * @param content Raw text content
     * @param filePath Optional (for error context)
     */
    public parseContent(content: string, filePath?: string): SVIFile {
        // Remove single-line and multi-line comments
        const noComments = content
            .replace(/\/\/.*$/gm, "")
            .replace(/\/\*[\s\S]*?\*\//gm, "")
            .trim();

        // Split by section headers starting with #
        const sections = noComments.split(/^#/gm).map(s => s.trim()).filter(Boolean);

        const svi: SVIFile = {};
        let currentHeader: string | null = null;
        let currentContent: string[] = [];

        for (const rawSection of sections) {
            const [headerLine, ...bodyLines] = rawSection.split("\n");
            const header = headerLine.trim();
            const body = bodyLines.join("\n").trim();

            switch (header.toLowerCase()) {
                case "destination file":
                    svi.destinationFile = body || undefined;
                    break;

                case "input parameters":
                    svi.inputParameters = this.splitList(body);
                    break;

                case "output":
                    svi.output = this.splitList(body);
                    break;

                case "options":
                    svi.options = this.parseOptions(body);
                    break;

                case "import prompts":
                    svi.importPrompts = this.splitList(body);
                    break;

                case "prompt":
                    svi.prompt = body || undefined;
                    break;

                default:
                    if (header.length > 0) {
                        console.warn(
                            `[SVIParser] Unknown section '${header}' in file ${filePath ?? "<string>"}`
                        );
                    }
                    break;
            }
        }

        return svi;
    }

    /**
     * Splits a section body into a list (by line or comma).
     */
    private splitList(body: string): string[] {
        if (!body) return [];
        return body
            .split(/\r?\n|,/)
            .map(s => s.trim())
            .filter(Boolean);
    }

    /**
     * Parses the `# Options` section into a key-value map.
     * Example:
     * ```
     * ProgrammingLanguage=Node.js
     * Active=True
     * ```
     */
    private parseOptions(body: string): Record<string, string | boolean> {
        const result: Record<string, string | boolean> = {};
        const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        for (const line of lines) {
            const [key, valueRaw] = line.split("=").map(s => s.trim());
            if (!key) continue;

            let value: string | boolean = valueRaw ?? "True";
            if (typeof value === "string") {
                if (/^(true|false)$/i.test(value)) {
                    value = value.toLowerCase() === "true";
                }
            }

            result[key] = value;
        }

        return result;
    }
}
