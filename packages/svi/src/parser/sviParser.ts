// parser/sviParser.ts
import fs from 'fs';
import path from 'path';

export interface SVIOptions {
    [key: string]: string | boolean;
}

export interface SVIFile {
    destinationFile?: string;
    inputParameters?: string[];
    output?: string[];
    options?: SVIOptions;
    prompt?: string;
    rawContent: string;
}

export class SVIParser {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    public parse(): SVIFile {
        if (!fs.existsSync(this.filePath)) {
            throw new Error(`File not found: ${this.filePath}`);
        }

        const content = fs.readFileSync(this.filePath, 'utf-8');
        return this.parseContent(content);
    }

    private parseContent(content: string): SVIFile {
        const sviFile: SVIFile = {
            rawContent: content,
            inputParameters: [],
            output: [],
            options: {},
        };

        // Entfernt mehrzeilige Kommentare /* ... */
        let cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '');

        // Aufteilen in Zeilen
        const lines = cleanContent.split(/\r?\n/).map(l => l.trim());

        let currentSection: 'destination' | 'input' | 'output' | 'options' | 'prompt' | null = null;

        for (const line of lines) {
            // Überspringe leere Zeilen oder einzeilige Kommentare
            if (!line || line.startsWith('//')) continue;

            // Abschnitt erkennen
            if (line.startsWith('# Destination File')) {
                currentSection = 'destination';
                continue;
            }
            if (line.startsWith('# Input parameters')) {
                currentSection = 'input';
                continue;
            }
            if (line.startsWith('# Output')) {
                currentSection = 'output';
                continue;
            }
            if (line.startsWith('# Options')) {
                currentSection = 'options';
                continue;
            }
            if (line.startsWith('# Prompt')) {
                currentSection = 'prompt';
                continue;
            }

            // Zeileninhalt je nach Abschnitt verarbeiten
            switch (currentSection) {
                case 'destination':
                    sviFile.destinationFile = line;
                    break;
                case 'input':
                    sviFile.inputParameters!.push(line);
                    break;
                case 'output':
                    sviFile.output!.push(line);
                    break;
                case 'options':
                    const [key, value] = line.split('=').map(s => s.trim());
                    if (value === undefined) continue;
                    sviFile.options![key] = this.parseOptionValue(value);
                    break;
                case 'prompt':
                    sviFile.prompt = (sviFile.prompt ? sviFile.prompt + '\n' : '') + line;
                    break;
            }
        }

        return sviFile;
    }

    private parseOptionValue(value: string): string | boolean {
        const valLower = value.toLowerCase();
        if (valLower === 'true') return true;
        if (valLower === 'false') return false;
        return value;
    }
}
