import fs from "fs";
import { SVIFile, SVIOptionValue } from "../types";
import SviFileClass from "../sviFileClass";
import logger from "../../utils/logger";

/**
 * Parses a `.svi` file into structured sections.
 * Supports single-line (`//`) and multi-line (`/* ... *\/`) comments.
 */
export class SVIParser {
  /**
   * Reads and parses a .svi file.
   * @param filePath Full path to the .svi file.
   */
  private parseErrors: string[] = [];
  private parseWarnings: string[] = [];

  public parseFile(filePath: string): SVIFile | null {
    this.parseErrors = [];
    this.parseWarnings = [];

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const parsedSvi = this.parseContent(raw, filePath);
    if (!parsedSvi) {
      return null;
    }

    if (!parsedSvi.prompt && !parsedSvi.importPrompts) {
      this.parseErrors.push(
        `[SVIParser] No 'Prompt' or 'Import Prompts' section found in file ${filePath}, looks like the file has incorrect format.
An example of the correct format:
=====================================
# Destination File
test.js
# Input parameters
Import function1(param1: number) : string from ../utils/utils.js
# Output
export function2(paramA: string) : number
# Options
Active=True
ProgrammingLanguage=node.js
# Import prompts
../prompts/common.svi
specific.svi
# Prompt
Test prompt
=====================================
        `,
      );
      return null;
    }

    return parsedSvi;
  }

  /**
   * Parses the raw content of a .svi file.
   * @param content Raw text content
   * @param filePath Optional (for error context)
   */
  public parseContent(content: string, filePath?: string): SVIFile | null {
    // Remove comments
    const noComments = content
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//gm, "")
      .trim();

    // Split by section headers starting with #
    /*const sections = noComments
      .split(/^#/gm)
      .map((s) => s.trim())
      .filter(Boolean);*/
    const sections = this.splitSections(noComments);

    const svi: SVIFile = new SviFileClass();
    const seenSections = new Set<string>(); // <-- Hier merken wir uns schon gesehene Header

    let result = true;

    for (const rawSection of sections) {
      const [headerLine, ...bodyLines] = rawSection.split("\n");
      const header = headerLine.trim();
      const body = bodyLines.join("\n").trim();

      const headerKey = header.toLowerCase();

      // Prüfen auf doppelte Abschnitte
      if (seenSections.has(headerKey)) {
        this.parseErrors.push(
          `[SVIParser] Duplicate section '${header}' found in file ${filePath ?? "<string>"}`,
        );
        this.parseErrors.push(
          `If you want to include a markdown syntax inside one of the *.svi file sections,
please include it as a code block, for example:`,
        );
        this.parseErrors.push(
          `\`\`\`markdown
# Prompt or any other section
Here is some markdown content
\`\`\``,
        );
        result = false;
        continue; // wir überspringen das erneute Setzen
      }
      seenSections.add(headerKey);

      switch (headerKey) {
        case "destination file":
          svi.destinationFile = body || undefined;
          break;

        case "dependencies":
          svi.dependencies = this.splitList(body);
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
            this.parseWarnings.push(
              `[SVIParser] Unknown section '${header}' in file ${filePath ?? "<string>"}`,
            );
          }
          break;
      }
    }
    if (!result) {
      return null;
    }

    svi.filePath = filePath;

    return svi;
  }

  private splitSections(content: string): string[] {
    const lines = content.split(/\r?\n/);

    const sections: string[] = [];
    let currentSection: string[] = [];
    let inCodeBlock = false;

    for (const line of lines) {
      // Toggle code block state
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        currentSection.push(line);
        continue;
      }

      // New section ONLY if not inside code block
      if (!inCodeBlock && line.startsWith("#")) {
        if (currentSection.length > 0) {
          sections.push(currentSection.join("\n").trim());
        }
        currentSection = [line.replace(/^#/, "").trim()];
      } else {
        currentSection.push(line);
      }
    }

    if (currentSection.length > 0) {
      sections.push(currentSection.join("\n").trim());
    }

    return sections.filter(Boolean);
  }

  /**
   * Splits a section body into a list (by line or comma).
   */
  private splitList(body: string): string[] {
    if (!body) return [];
    return body
      .split(/\r?\n|,/)
      .map((s) => s.trim())
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
  private parseOptions(body: string): Record<string, SVIOptionValue> {
    const result: Record<string, SVIOptionValue> = {};
    const lines = body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      const [key, valueRaw] = line.split("=").map((s) => s.trim());
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

  public logParseMessages(): void {
    for (const error of this.parseErrors) {
      logger.error(error);
    }

    for (const warning of this.parseWarnings) {
      logger.warn(warning);
    }
  }
}
