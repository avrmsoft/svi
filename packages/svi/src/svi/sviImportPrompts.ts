import { SVIFile } from "./types";
import Logger from "../utils/logger";
import path from "path";
import { SVIParser } from "./sviParser";
import { computeHashFromString } from "../utils/utils";

interface ImportedPrompt {
  prompt: string;
  hash: string;
}

export class SVIImportPrompts {
  private sviFile: SVIFile;
  private importedPrompts: ImportedPrompt[] = [];

  constructor(sviFile: SVIFile) {
    this.sviFile = sviFile;
  }

  public getImportedPrompts(): ImportedPrompt[] {
    return this.importedPrompts;
  }

  public getImportedPromptsAsString(): string {
    return this.importedPrompts.map((imp) => imp.prompt).join("\n---\n");
  }

  public loadImportedPrompts(): void {
    this.loadImportedPromptsFromSvi(this.sviFile);
  }

  private loadImportedPromptsFromSvi(sviFile: SVIFile): void {
    if (!sviFile.importPrompts || sviFile.importPrompts.length === 0) {
      return;
    }

    for (const promptPath of sviFile.importPrompts) {
      const resolvedPath = this.resolvePromptPath(promptPath, sviFile);
      this.loadPromptForPath(resolvedPath);

      //const dependencySVI = this.loadSVIFile(resolvedPath);
      //if (dependencySVI && dependencySVI.prompt) {

      /*const promptContent = dependencySVI.prompt;
        const promptHash = this.computeHash(promptContent);
        this.importedPrompts.push({
          prompt: promptContent,
          hash: promptHash,
        });*/
      //} else {
      //  Logger.error(
      //    `Failed to load imported prompt from dependency ${resolvedPath}`
      //  );
      //}
    }
  }

  private resolvePromptPath(
    promptPath: string,
    relativeToSvi?: SVIFile
  ): string {
    const relativeToSviFile = relativeToSvi || this.sviFile;
    if (relativeToSviFile.filePath) {
      const sviDir = path.dirname(relativeToSviFile.filePath);
      return path.resolve(sviDir, promptPath);
    }
    return promptPath;
  }

  private loadSVIFile(filePath: string): SVIFile | null {
    try {
      const parser = new SVIParser();
      return parser.parseFile(filePath);
    } catch (error) {
      Logger.error(`Error loading SVI file ${filePath}: ${error}`);
      return null;
    }
  }

  private computeHash(content: string): string {
    return computeHashFromString(content);
  }

  private loadPromptForPath(path: string): void {
    const dependencySVI = this.loadSVIFile(path);
    if (dependencySVI && dependencySVI.prompt) {
      const promptContent = dependencySVI.prompt;
      const promptHash = this.computeHash(promptContent);
      if (this.hashExists(promptHash)) {
        return;
      }

      this.importedPrompts.push({
        prompt: promptContent,
        hash: promptHash,
      });

      this.loadImportedPromptsFromSvi(dependencySVI);
    } else {
      Logger.error(`Failed to load imported prompt from dependency ${path}`);
    }
  }

  private hashExists(hash: string): boolean {
    return this.importedPrompts.some((imp) => imp.hash === hash);
  }
}
